import { Component, computed, inject } from '@angular/core';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-loading',
  standalone: true,
  templateUrl: './loading.html',
  styleUrl: './loading.css',
})
export class Loading {
  private loadingBar = inject(LoadingBarService);

  isLoading = toSignal(this.loadingBar.value$.pipe(map((v) => v > 0)), { initialValue: false });
}
