import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { EvolutionDialogData } from '../../models/evolution-modal.types';
import { getPokemonBgClass } from '../../utils/pokemon-color.util';

@Component({
  standalone: true,
  selector: 'app-evolution-modal',
  imports: [CommonModule, MatDialogModule],
  templateUrl: './evolution-modal.html',
  styleUrl: './evolution-modal.css',
})
export class EvolutionModal {
  getPokemonBgClass = getPokemonBgClass;
  onWheel(event: WheelEvent) {
    event.preventDefault();
    const container = event.currentTarget as HTMLElement;
    container.scrollLeft += event.deltaY;
  }
  @ViewChild('carousel', { static: true })
  carousel!: ElementRef<HTMLDivElement>;

  currentIndex = 0;

  next() {
    if (this.currentIndex < this.data.evolutions.length - 1) {
      this.currentIndex++;
      this.scroll();
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.scroll();
    }
  }

  scroll() {
    const width = this.carousel.nativeElement.clientWidth;
    this.carousel.nativeElement.scrollTo({
      left: width * this.currentIndex,
      behavior: 'smooth',
    });
  }

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: EvolutionDialogData,
  ) {}
}
