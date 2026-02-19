import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { GithubService } from '../../../core/services/github.service';
import { GitHubUser } from '../../../core/models/user.model';
import { ProfileSidebarComponent } from '../profile-sidebar/profile-sidebar.component';
import { HeaderComponent } from '../../../core/components/header/header.component';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-profile-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ProfileSidebarComponent, HeaderComponent],
  template: `
    <app-header></app-header>
    <div class="layout-container">
      <nav class="sticky-nav">
         <div class="tabs-container">
            <div class="sidebar-spacer"></div>
            <nav class="UnderlineNav-body">
              <a routerLink="overview" routerLinkActive="selected" class="UnderlineNav-item">
                <span class="icon">📖</span> Overview
              </a>
              <a routerLink="repositories" routerLinkActive="selected" class="UnderlineNav-item">
                <span class="icon">🖥️</span> Repositories 
                <span class="counter" *ngIf="user">{{ user.public_repos }}</span>
              </a>
              <a routerLink="projects" routerLinkActive="selected" class="UnderlineNav-item">
                <span class="icon">📊</span> Projects
              </a>
              <a routerLink="packages" routerLinkActive="selected" class="UnderlineNav-item">
                <span class="icon">📦</span> Packages
              </a>
              <a routerLink="stars" routerLinkActive="selected" class="UnderlineNav-item">
                <span class="icon">⭐</span> Stars
              </a>
            </nav>
         </div>
      </nav>

      <div class="main-content">
        <div class="sidebar-wrapper">
          <app-profile-sidebar *ngIf="user" [user]="user"></app-profile-sidebar>
        </div>
        
        <div class="tab-content-wrapper">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #0d1117;
      min-height: 100vh;
      color: #c9d1d9;
    }
    
    .layout-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 16px;
    }

    .sticky-nav {
      position: sticky;
      top: 0;
      z-index: 10;
      background-color: #0d1117;
      border-bottom: 1px solid #21262d;
      margin-bottom: 32px;
      padding-top: 16px;
    }

    .tabs-container {
        display: flex;
        gap: 24px;
        align-items: center;
    }
    
    .UnderlineNav-body {
      display: flex;
      gap: 16px;
    }

    .UnderlineNav-item {
      padding: 8px 16px;
      font-size: 14px;
      line-height: 30px;
      color: #c9d1d9;
      text-align: center;
      border-bottom: 2px solid transparent;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .UnderlineNav-item:hover {
      border-bottom-color: #8b949e;
      color: #c9d1d9;
    }
    
    .UnderlineNav-item.selected {
      font-weight: 600;
      border-bottom-color: #f78166;
      color: #c9d1d9;
    }
    
    .UnderlineNav-item.selected .icon {
        color: #c9d1d9;
    }

    .counter {
        display: inline-block;
        min-width: 20px;
        padding: 0 6px;
        font-size: 12px;
        font-weight: 500;
        line-height: 18px;
        color: #c9d1d9;
        text-align: center;
        background-color: #21262d; 
        border: 1px solid transparent;
        border-radius: 2em;
    }
    
    .main-content {
      display: flex;
      gap: 24px;
      flex-direction: row;
      align-items: flex-start;
      max-width: 100%; /* Ensure it doesn't exceed screen */
    }
    
    .sidebar-wrapper {
      width: 296px;
      flex-shrink: 0;
      margin-top: -32px; 
      z-index: 20;
    }
    
    .tab-content-wrapper {
      flex-grow: 1;
      min-width: 0; /* Crucial for flex item shrinking */
      max-width: 100%; /* Double safety */
    }

    @media (max-width: 768px) {
      .main-content {
        flex-direction: column;
        gap: 0; /* Remove gap in column mode, handle via margins */
      }
      .sidebar-wrapper {
        width: 100%;
        margin-top: 0;
        margin-bottom: 24px;
      }
      .tabs-container {
         overflow-x: auto;
         justify-content: flex-start;
         margin-left: -16px; /* Offset parent padding for full-bleed look */
         margin-right: -16px;
         padding-left: 16px;
         padding-right: 16px;
      }
       .tabs-container div:first-child {
           display: none;
       }
    }
  `]
})
export class ProfileLayoutComponent implements OnInit {
  user: GitHubUser | null = null;
  username = 'shreeramk';

  constructor(
    private route: ActivatedRoute,
    private githubService: GithubService
  ) { }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const user = params.get('username');
        if (user) {
          this.username = user;
          return this.githubService.getUser(this.username);
        }
        // Default user fetch logic
        return this.githubService.getUser(this.username);
      })
    ).subscribe({
      next: (data) => {
        this.user = data;
      },
      error: (err) => console.error(err)
    });
  }
}
