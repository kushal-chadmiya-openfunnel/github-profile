import { Component } from '@angular/core';

@Component({
    selector: 'app-placeholder',
    standalone: true,
    template: `
    <div class="placeholder-container">
      <div class="blankslate">
        <h3>This section hasn't been implemented yet.</h3>
        <p>Working but empty as per the assignment requirements.</p>
      </div>
    </div>
  `,
    styles: [`
    .placeholder-container {
      padding: 32px 0;
      text-align: center;
    }
    .blankslate {
      padding: 80px 40px;
      background-color: #0d1117;
      border: 1px solid #30363d;
      border-radius: 6px;
    }
    h3 {
      color: #c9d1d9;
      margin-bottom: 8px;
    }
    p {
      color: #8b949e;
    }
  `]
})
export class PlaceholderComponent { }
