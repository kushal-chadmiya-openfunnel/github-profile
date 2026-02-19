import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GithubService } from '../../../core/services/github.service';
import { GitHubRepo } from '../../../core/models/user.model';


@Component({
  selector: 'app-repositories',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="repos-container">
      <div class="repo-list">
        <div class="repo-item" *ngFor="let repo of repos">
           <div class="repo-header">
             <h3>
               <a [href]="repo.html_url" target="_blank">{{ repo.name }}</a>
               <span class="label-public" *ngIf="!repo.private">Public</span>
             </h3>
           </div>
           
           <div class="repo-desc" *ngIf="repo.description">
             {{ repo.description }}
           </div>
           
           <div class="repo-meta">
              <span class="meta-item" *ngIf="repo.language">
                <span class="lang-color"></span> {{ repo.language }}
              </span>
              <span class="meta-item" *ngIf="repo.stargazers_count > 0">
                 ⭐ {{ repo.stargazers_count }}
              </span>
              <span class="meta-item" *ngIf="repo.forks_count > 0">
                 🍴 {{ repo.forks_count }}
              </span>
              <span class="meta-item">
                 Updated {{ repo.updated_at | date:'mediumDate' }}
              </span>
           </div>
           
           <div class="divider"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .repos-container {
        padding-top: 8px;
    }
    .repo-item {
        padding: 24px 0;
        border-bottom: 1px solid #21262d;
    }
    .repo-header {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .repo-header h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
    }
    .repo-header a {
        color: #58a6ff;
        text-decoration: none;
    }
    .repo-header a:hover {
        text-decoration: underline;
    }
    .label-public {
        border: 1px solid #30363d;
        border-radius: 2em;
        padding: 0 7px;
        font-size: 12px;
        font-weight: 500;
        color: #8b949e;
        line-height: 18px;
    }
    .repo-desc {
        color: #8b949e;
        margin-top: 8px;
        margin-bottom: 16px;
        font-size: 14px;
        max-width: 80%;
    }
    .repo-meta {
        font-size: 12px;
        color: #8b949e;
        display: flex;
        gap: 16px;
        align-items: center;
    }
    .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
    }
    .lang-color {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #f1e05a; /* Default to JS yellow, ideally map colors */
        display: inline-block;
    }
  `]
})
export class RepositoriesComponent implements OnInit {
  repos: GitHubRepo[] = [];

  constructor(
    private githubService: GithubService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.parent?.paramMap.subscribe(params => {
      const username = params.get('username') ?? 'shreeramk';
      this.githubService.getRepos(username).subscribe(repos => {
        this.repos = repos;
      });
    });
  }
}
