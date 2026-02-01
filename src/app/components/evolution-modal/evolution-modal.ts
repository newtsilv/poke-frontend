import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-evolution-modal',
  imports: [CommonModule, MatDialogModule],
  templateUrl: './evolution-modal.html',
  styleUrl: './evolution-modal.css',
})
export class EvolutionModal {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      evolutions: { id: number; name: string, image: string , types: string[]}[];
    },
  ) {}
}
