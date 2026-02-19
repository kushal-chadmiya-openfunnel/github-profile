import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GitHubUser } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-sidebar" *ngIf="user">
      <div class="avatar-container">
        <img [src]="user.avatar_url" alt="Avatar" class="avatar">
        <div class="status-icon">😊</div>
      </div>
      
      <div class="names">
        <h1 class="vcard-names">
          <span class="p-name">{{ user.name }}</span>
          <span class="p-nickname">{{ user.login }}</span>
        </h1>
      </div>

      <div class="bio" *ngIf="user.bio">
        {{ user.bio }}
      </div>

      <button class="btn-follow">Edit profile</button>

      <div class="stats">
        <a href="#" class="stat-item">
          <svg class="stat-icon" viewBox="0 0 16 16" width="16" height="16" fill="#8b949e"><path d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4.001 4.001 0 0 0-7.9 0 .75.75 0 0 1-1.482-.235 5.508 5.508 0 0 1 3.034-4.084A3.489 3.489 0 0 1 2 5.5ZM4.5 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/><path d="M12.912 9.339c.346.074.59.378.588.727-.002.448-.318.81-.748.878a3.007 3.007 0 0 0-2.325 3.86.75.75 0 0 1-1.442.41 4.508 4.508 0 0 1 3.555-5.632.75.75 0 0 1 .372-.243ZM11.5 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM8 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"/></svg>
          <span class="count">{{ user.followers }}</span> followers
        </a>
        <span>·</span>
        <a href="#" class="stat-item">
          <span class="count">{{ user.following }}</span> following
        </a>
      </div>

      <div class="details">
        <div class="detail-item" *ngIf="user.company">
          <span class="icon">🏢</span> {{ user.company }}
        </div>
        <div class="detail-item" *ngIf="user.location">
          <span class="icon">📍</span> {{ user.location }}
        </div>
        <div class="detail-item" *ngIf="user.email">
          <span class="icon">✉️</span> <a [href]="'mailto:' + user.email">{{ user.email }}</a>
        </div>
        <div class="detail-item" *ngIf="user.blog">
          <span class="icon">🔗</span> <a [href]="user.blog" target="_blank">{{ user.blog }}</a>
        </div>
        <div class="detail-item" *ngIf="user.twitter_username">
          <span class="icon">🐦</span> @{{ user.twitter_username }}
        </div>
      </div>
      
      <div class="achievements">
        <h3>Achievements</h3>
        <div class="achievement-badges">
          <img src="https://github.githubassets.com/images/modules/profile/achievements/pull-shark-default.png" alt="Pull Shark">
          <img src="https://github.githubassets.com/images/modules/profile/achievements/yolo-default.png" alt="YOLO">
          <img src="https://github.githubassets.com/images/modules/profile/achievements/quickdraw-default.png" alt="Quickdraw">
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-sidebar {
      width: 296px;
      padding-right: 24px;
      font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";
      color: #c9d1d9;
    }
    
    .avatar-container {
      position: relative;
      margin-bottom: 16px;
    }
    
    .avatar {
      width: 100%;
      border-radius: 50%;
      border: 1px solid #30363d;
      z-index: 1;
    }
    
    .status-icon {
      position: absolute;
      bottom: 10%;
      left: 85%;
      background: #21262d;
      border: 1px solid #30363d;
      border-radius: 2em;
      padding: 0px 8px;
      font-size: 14px;
      line-height: 1.5;
      color: #c9d1d9;
      box-shadow: 0 0 0 2px #0d1117;
      cursor: pointer;
    }
    
    .vcard-names {
      margin-top: 0;
      margin-bottom: 16px;
    }
    
    .p-name {
      display: block;
      font-size: 24px;
      line-height: 1.25;
      font-weight: 600;
      color: #c9d1d9;
    }
    
    .p-nickname {
      display: block;
      font-size: 20px;
      font-style: normal;
      font-weight: 300;
      line-height: 24px;
      color: #8b949e;
    }
    
    .bio {
      font-size: 16px;
      margin-bottom: 16px;
      color: #c9d1d9;
    }
    
    .btn-follow {
      width: 100%;
      background-color: #21262d;
      color: #c9d1d9;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 5px 16px;
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
      cursor: pointer;
      margin-bottom: 16px;
      transition: 0.2s;
    }
    
    .btn-follow:hover {
      background-color: #30363d;
      border-color: #8b949e;
    }
    
    .stats {
      margin-bottom: 16px;
      font-size: 14px;
      color: #8b949e;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .stats a {
      color: #8b949e;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .stats a:hover {
      color: #58a6ff;
      text-decoration: none;
    }

    .stats .count {
      font-weight: 600;
      color: #c9d1d9;
    }
    
    .icon {
      margin-right: 4px;
      text-align: center;
      width: 16px;
    }
    
    .detail-item {
      margin-top: 4px;
      font-size: 14px;
      color: #c9d1d9;
      display: flex;
      align-items: center;
    }

    .detail-item a {
      color: #c9d1d9;
      text-decoration: none;
    }
    .detail-item a:hover {
      text-decoration: underline;
      color: #58a6ff;
    }
    
    .achievements {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #21262d;
    }
    
    .achievements h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
      margin-top: 0;
      color: #c9d1d9;
    }
    
    .achievement-badges img {
      width: 64px;
      height: 64px;
      margin-right: 4px;
    }

    @media (max-width: 768px) {
      .profile-sidebar {
        width: 100%;
        padding-right: 0;
        margin-bottom: 24px;
      }
      .avatar-container {
        display: flex;
        gap: 16px;
        align-items: center;
      }
      .avatar {
        width: 15%;
      }
      .names {
        margin-top: 0;
      }
    }
  `]
})
export class ProfileSidebarComponent {
  @Input() user: GitHubUser | null = null;
}
