import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { ToastStack } from './shared/toast';

/**
 * Application shell: header, routed page and global toast outlet.
 * Feature screens are lazy-loaded, so this component stays tiny.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastStack],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
