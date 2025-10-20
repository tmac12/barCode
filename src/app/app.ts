import { Component, signal, ElementRef, ViewChild, OnInit, afterNextRender, Injector } from '@angular/core';
import { BarcodeDetector } from 'barcode-detector/ponyfill';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('barCode');
  protected readonly isScanning = signal(false);
  protected readonly detectedBarcode = signal<string>('');
  protected readonly error = signal<string>('');
  protected readonly debugInfo = signal<string>('');

  @ViewChild('video', { static: false }) videoElement?: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: false }) canvasElement?: ElementRef<HTMLCanvasElement>;

  private stream: MediaStream | null = null;
  private barcodeDetector: BarcodeDetector | null = null;
  private animationId: number | null = null;
  private pendingStream: MediaStream | null = null;

  constructor(private injector: Injector) {}

  ngOnInit() {
    this.checkEnvironment();
  }

  private checkEnvironment() {
    const isHttps = location.protocol === 'https:';
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

    let info = `Protocol: ${location.protocol}, Host: ${location.hostname}\n`;
    info += `HTTPS: ${isHttps}, Localhost: ${isLocalhost}\n`;
    info += `MediaDevices API: ${hasMediaDevices}\n`;
    info += `User Agent: ${navigator.userAgent}`;

    this.debugInfo.set(info);

    if (!hasMediaDevices) {
      this.error.set('Camera API not supported in this browser.');
    } else if (!isHttps && !isLocalhost) {
      this.error.set('Camera access requires HTTPS connection (or localhost for testing).');
    }
  }

  async startBarcodeScanning() {
    try {
      this.error.set('');
      this.detectedBarcode.set('');

      console.log('Starting barcode scanning...');

      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      console.log('Requesting camera access...');

      // Check if BarcodeDetector is supported
      if (!('BarcodeDetector' in window)) {
        // Use ponyfill if native API is not available
        this.barcodeDetector = new BarcodeDetector();
      } else {
        this.barcodeDetector = new (window as any).BarcodeDetector();
      }

      // Request camera access with more explicit options
      const constraints = {
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      console.log('Camera constraints:', constraints);

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      console.log('Camera access granted!', stream);

      // Store stream and trigger view rendering with signal
      this.pendingStream = stream;
      this.isScanning.set(true);

      // Use afterNextRender to initialize video after DOM update
      afterNextRender(() => {
        if (this.pendingStream && this.videoElement) {
          this.initializeVideoStream(this.pendingStream);
          this.pendingStream = null;
        }
      }, { injector: this.injector });
    } catch (err: any) {
      console.error('Error accessing camera:', err);

      let errorMessage = 'Failed to access camera. ';

      if (err.name === 'NotAllowedError') {
        errorMessage += 'Camera permission was denied. Please allow camera access and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage += 'Camera access is not supported in this browser.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is already in use by another application.';
      } else if (err.message.includes('HTTPS')) {
        errorMessage += 'Camera access requires HTTPS connection (except on localhost).';
      } else {
        errorMessage += `Error: ${err.message}`;
      }

      this.error.set(errorMessage);
      this.isScanning.set(false);
    }
  }

  private initializeVideoStream(stream: MediaStream) {
    if (!this.videoElement) return;

    this.stream = stream;
    const video = this.videoElement.nativeElement;
    video.srcObject = stream;
    video.play();

    // Start scanning when video is ready
    video.addEventListener('loadedmetadata', () => {
      console.log('Video loaded, starting barcode detection');
      this.scanForBarcodes();
    });
  }

  private scanForBarcodes() {
    if (!this.isScanning() || !this.barcodeDetector || !this.videoElement || !this.canvasElement) return;

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Detect barcodes in the current frame
    this.barcodeDetector
      .detect(canvas)
      .then((barcodes) => {
        if (barcodes.length > 0) {
          const barcode = barcodes[0];
          this.detectedBarcode.set(barcode.rawValue);
          this.stopScanning();
        } else {
          // Continue scanning
          this.animationId = requestAnimationFrame(() => this.scanForBarcodes());
        }
      })
      .catch((err) => {
        console.error('Barcode detection error:', err);
        this.error.set('Error during barcode detection');
      });
  }

  stopScanning() {
    this.isScanning.set(false);

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  clearResults() {
    this.detectedBarcode.set('');
    this.error.set('');
  }
}
