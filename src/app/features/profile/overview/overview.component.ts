import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { GithubService, PinnedRepo } from '../../../core/services/github.service';
import { ContributionCalendar } from '../../../core/models/user.model';
import { EChartsOption } from 'echarts';
import { ActivatedRoute } from '@angular/router';

interface GroupedEvent { date: string; events: any[]; }

// GitHub language color map (subset of most-used)
const LANG_COLORS: Record<string, string> = {
    JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
    Java: '#b07219', 'C++': '#f34b7d', C: '#555555', 'C#': '#178600',
    Go: '#00ADD8', Rust: '#dea584', Kotlin: '#A97BFF', Swift: '#F05138',
    Ruby: '#701516', PHP: '#4F5D95', HTML: '#e34c26', CSS: '#563d7c',
    Dart: '#00B4AB', Shell: '#89e051', Vue: '#41b883', Svelte: '#ff3e00',
    Scala: '#c22d40', R: '#198CE7', Lua: '#000080', Haskell: '#5e5086',
    Elixir: '#6e4a7e', Clojure: '#db5855', SCSS: '#c6538c',
};

function getLangColor(lang: string | null): string {
    if (!lang) return '#8b949e';
    return LANG_COLORS[lang] ?? '#8b949e';
}

@Component({
    selector: 'app-overview',
    standalone: true,
    imports: [CommonModule, NgxEchartsModule],
    template: `
    <div class="overview-container">

      <!-- ── Pinned / Popular Repositories ── -->
      <div class="section-block" *ngIf="pinnedRepos.length > 0">
        <div class="section-header">
          <span class="section-title">Popular repositories</span>
          <a href="#" class="customize-link">Customize your pins</a>
        </div>
        <div class="pinned-grid">
          <a *ngFor="let repo of pinnedRepos" [href]="repo.url" target="_blank" class="pin-card">
            <div class="pin-card-header">
              <svg class="repo-icon" viewBox="0 0 16 16" width="16" height="16" fill="#8b949e">
                <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z"/>
              </svg>
              <span class="pin-name">{{ repo.name }}</span>
              <span class="pin-visibility">{{ repo.isPrivate ? 'Private' : 'Public' }}</span>
            </div>
            <p class="pin-desc" *ngIf="repo.description">{{ repo.description }}</p>
            <div class="pin-meta">
              <span class="lang-dot" *ngIf="repo.primaryLanguage"
                    [style.background]="getLangColor(repo.primaryLanguage.name)"></span>
              <span class="lang-name" *ngIf="repo.primaryLanguage">{{ repo.primaryLanguage.name }}</span>
              <span class="meta-stat" *ngIf="repo.stargazerCount > 0">
                <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>
                {{ repo.stargazerCount }}
              </span>
              <span class="meta-stat" *ngIf="repo.forkCount > 0">
                <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/></svg>
                {{ repo.forkCount }}
              </span>
            </div>
          </a>
        </div>
      </div>

      <!-- ── Contribution Graph ── -->
      <div class="section-block contrib-section">

        <div class="contrib-top-row">
          <h3 class="contrib-count" *ngIf="!isLoading">
            {{ totalContributions | number }} contributions in {{ selectedYear === currentYear ? 'the last year' : selectedYear }}
          </h3>
          <h3 class="contrib-count loading-text" *ngIf="isLoading">Loading…</h3>
          <div class="contrib-settings-link">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="#8b949e"><path d="M8 0a8.2 8.2 0 0 1 .701.031C9.444.095 9.99.645 10.16 1.29l.288 1.107c.018.066.079.158.212.224.231.114.454.243.668.386.123.08.233.09.299.071l1.103-.303c.644-.176 1.392.021 1.82.63.27.385.506.792.704 1.218.315.675.111 1.422-.364 1.891l-.814.806c-.049.048-.098.147-.088.294.016.257.016.515 0 .772-.01.147.038.246.088.294l.814.806c.475.469.679 1.216.364 1.891a7.977 7.977 0 0 1-.704 1.217c-.428.61-1.176.807-1.82.63l-1.103-.302c-.067-.019-.177-.009-.3.071a5.909 5.909 0 0 1-.668.386c-.133.066-.194.158-.211.224l-.29 1.106c-.168.646-.715 1.196-1.458 1.26a8.006 8.006 0 0 1-1.402 0c-.744-.064-1.29-.614-1.459-1.26l-.289-1.106c-.018-.066-.079-.158-.212-.224a5.738 5.738 0 0 1-.668-.386c-.123-.08-.233-.09-.299-.071l-1.103.303c-.644.176-1.392-.021-1.82-.63a8.12 8.12 0 0 1-.704-1.218c-.315-.675-.111-1.422.363-1.891l.815-.806c.05-.048.098-.147.088-.294a6.214 6.214 0 0 1 0-.772c.01-.147-.038-.246-.088-.294l-.815-.806C.635 6.045.431 5.298.746 4.623a7.92 7.92 0 0 1 .704-1.217c.428-.61 1.176-.807 1.82-.63l1.103.303c.066.019.176.009.299-.071.214-.143.437-.272.668-.386.133-.066.194-.158.211-.224l.29-1.106C6.009.645 6.556.095 7.299.03 7.53.01 7.764 0 8 0Zm-.196 1.505a.5.5 0 0 0-.346.387l-.29 1.106c-.1.38-.358.664-.62.798a4.466 4.466 0 0 0-.507.294c-.258.167-.554.228-.838.148L4.1 3.935a.5.5 0 0 0-.521.18 6.395 6.395 0 0 0-.565.977.5.5 0 0 0 .1.563l.815.806c.274.27.405.633.387.986a4.707 4.707 0 0 0 0 .586c.018.353-.113.716-.387.986l-.815.806a.5.5 0 0 0-.1.563c.166.36.360.700.565.977a.5.5 0 0 0 .521.18l1.103-.303c.284-.08.58-.019.838.148.156.101.316.195.507.294.262.134.52.418.62.798l.29 1.106a.5.5 0 0 0 .345.387 6.5 6.5 0 0 0 1.124 0 .5.5 0 0 0 .346-.387l.29-1.106c.099-.38.357-.664.62-.798a4.357 4.357 0 0 0 .507-.294c.258-.167.553-.227.838-.148l1.102.302a.5.5 0 0 0 .522-.18 6.395 6.395 0 0 0 .565-.977.5.5 0 0 0-.1-.563l-.815-.806a1.492 1.492 0 0 1-.387-.986 4.712 4.712 0 0 0 0-.586c-.018-.353.113-.716.387-.986l.815-.806a.5.5 0 0 0 .1-.563 6.347 6.347 0 0 0-.565-.977.5.5 0 0 0-.521-.18l-1.103.303c-.284.08-.58.019-.838-.148a4.493 4.493 0 0 0-.507-.294c-.262-.134-.52-.418-.62-.798l-.29-1.106a.5.5 0 0 0-.346-.387 6.5 6.5 0 0 0-1.124 0ZM8 5.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z"/></svg>
            Contribution settings
          </div>
        </div>

        <div class="contrib-body">
          <!-- Graph Area -->
          <div class="graph-area">
            <!-- Graph -->
            <div class="calendar-box" [class.loading]="isLoading">
              <div *ngIf="!isLoading && !hasError && chartOption.series" class="calendar-graph">
                <div echarts [options]="chartOption" class="echarts-chart"></div>
              </div>

              <!-- Skeleton -->
              <div *ngIf="isLoading" class="graph-skeleton">
                <div class="skeleton-bar" *ngFor="let w of skeletonWeeks"></div>
              </div>

              <!-- Error -->
              <div *ngIf="!isLoading && hasError" class="error-msg">
                ⚠️ Could not load contributions. Add your GitHub token in <code>environment.ts</code>.
              </div>
            </div>

            <!-- Graph footer row -->
            <div class="graph-footer">
              <a href="https://docs.github.com/articles/why-are-my-contributions-not-showing-up-on-my-profile"
                 target="_blank" class="learn-link">Learn how we count contributions</a>
              <div class="legend">
                <span class="legend-label">Less</span>
                <span class="legend-cell" style="background:#161b22"></span>
                <span class="legend-cell" style="background:#0e4429"></span>
                <span class="legend-cell" style="background:#006d32"></span>
                <span class="legend-cell" style="background:#26a641"></span>
                <span class="legend-cell" style="background:#39d353"></span>
                <span class="legend-label">More</span>
              </div>
            </div>
          </div>

          <!-- Year Selector Sidebar -->
          <div class="year-selector">
            <button *ngFor="let yr of availableYears"
                    (click)="selectYear(yr)"
                    [class.active]="yr === selectedYear"
                    class="year-btn">
              {{ yr }}
            </button>
          </div>
        </div>
      </div>

      <!-- ── Contribution Activity ── -->
      <div class="section-block">
        <div class="activity-header">Contribution activity</div>

        <div *ngIf="isLoadingEvents" class="no-activity">Loading activity…</div>
        <div *ngIf="!isLoadingEvents && groupedEvents.length === 0" class="no-activity">
          No public activity in the last 30 days.
        </div>

        <div *ngFor="let group of groupedEvents" class="event-group">
          <div class="event-date-label">{{ group.date | date:'MMMM d, y' }}</div>
          <ul>
            <li *ngFor="let event of group.events" class="event-item">
              <span class="event-icon">{{ getEventIcon(event.type) }}</span>
              <div class="event-details">
                <span class="event-action">{{ getEventLabel(event) }}</span>
                <a [href]="'https://github.com/' + event.repo.name" target="_blank" class="repo-link">
                  {{ event.repo.name }}
                </a>
              </div>
            </li>
          </ul>
        </div>
      </div>

    </div>
    `,
    styles: [`
    .overview-container {
      padding: 16px 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
    }

    /* ── Section blocks ── */
    .section-block {
      margin-bottom: 24px;
    }

    /* ── Popular Repos ── */
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #c9d1d9;
    }
    .customize-link {
      font-size: 12px;
      color: #58a6ff;
      text-decoration: none;
    }
    .customize-link:hover { text-decoration: underline; }

    .pinned-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    @media (max-width: 640px) { .pinned-grid { grid-template-columns: 1fr; } }

    .pin-card {
      display: flex;
      flex-direction: column;
      gap: 6px;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 16px;
      text-decoration: none;
      background: #0d1117;
      transition: border-color .15s;
      min-height: 80px;
    }
    .pin-card:hover { border-color: #8b949e; }

    .pin-card-header {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .repo-icon { flex-shrink: 0; }

    .pin-name {
      font-size: 14px;
      font-weight: 600;
      color: #58a6ff;
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .pin-visibility {
      font-size: 11px;
      color: #8b949e;
      border: 1px solid #30363d;
      border-radius: 2em;
      padding: 0 7px;
      line-height: 18px;
      flex-shrink: 0;
    }
    .pin-desc {
      font-size: 12px;
      color: #8b949e;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex: 1;
    }
    .pin-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      color: #8b949e;
    }
    .lang-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .lang-name { color: #8b949e; }
    .meta-stat {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #8b949e;
    }

    /* ── Contribution section header ── */
    .contrib-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      flex-wrap: wrap;
      gap: 8px;
    }
    .contrib-count {
      font-size: 16px;
      font-weight: 400;
      color: #c9d1d9;
      margin: 0;
    }
    .loading-text { color: #8b949e; font-style: italic; }
    .contrib-settings-link {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #8b949e;
      cursor: pointer;
    }
    .contrib-settings-link:hover { color: #58a6ff; }

    /* Card that holds graph + year selector */
    .contrib-body {
      display: flex;
      gap: 0;
      border: 1px solid #30363d;
      border-radius: 6px;
      background: #0d1117;
      overflow: hidden;
    }
    .graph-area {
      flex: 1;
      padding: 16px;
      min-width: 0;
      border-right: 1px solid #30363d;
    }

    /* ── Calendar Graph ── */
    .calendar-box { width: 100%; }
    .calendar-graph {
      overflow-x: auto;
      scrollbar-width: thin;
      scrollbar-color: #30363d transparent;
    }
    .calendar-graph::-webkit-scrollbar { height: 5px; }
    .calendar-graph::-webkit-scrollbar-thumb { background: #30363d; border-radius: 4px; }

    .echarts-chart {
      height: 150px;
      min-width: 770px;
    }

    /* Skeleton */
    .graph-skeleton {
      display: flex;
      gap: 3px;
      align-items: stretch;
      height: 112px;
    }
    .skeleton-bar {
      flex: 1;
      background: #161b22;
      border-radius: 2px;
      animation: skpulse 1.4s ease-in-out infinite;
    }
    .skeleton-bar:nth-child(2n)  { animation-delay: 0.2s; }
    .skeleton-bar:nth-child(3n)  { animation-delay: 0.4s; }
    .skeleton-bar:nth-child(5n)  { animation-delay: 0.6s; }
    @keyframes skpulse {
      0%, 100% { opacity: 0.4; }
      50%       { opacity: 0.8; }
    }

    .error-msg {
      color: #f78166;
      font-size: 13px;
      padding: 16px 0;
    }
    .error-msg code {
      background: #21262d;
      padding: 1px 5px;
      border-radius: 4px;
      font-size: 12px;
    }

    /* Graph footer */
    .graph-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;
      flex-wrap: wrap;
      gap: 6px;
    }
    .learn-link {
      font-size: 12px;
      color: #8b949e;
      text-decoration: none;
    }
    .learn-link:hover { color: #58a6ff; text-decoration: underline; }
    .legend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #8b949e;
    }
    .legend-cell {
      width: 10px;
      height: 10px;
      border-radius: 2px;
      border: 1px solid rgba(255,255,255,0.07);
    }
    .legend-label { margin: 0 2px; }

    /* ── Year Selector ── */
    .year-selector {
      display: flex;
      flex-direction: column;
      padding: 8px 0;
      min-width: 68px;
      background: #0d1117;
    }
    .year-btn {
      padding: 6px 14px;
      background: none;
      border: none;
      color: #8b949e;
      font-size: 13px;
      cursor: pointer;
      text-align: left;
      white-space: nowrap;
      transition: background .1s, color .1s;
      border-radius: 0;
    }
    .year-btn:hover {
      background: #161b22;
      color: #c9d1d9;
    }
    .year-btn.active {
      background: #1f6feb;
      color: #ffffff;
      font-weight: 600;
      border-radius: 6px;
      margin: 0 6px;
      padding: 6px 8px;
    }

    /* ── Activity ── */
    .activity-header {
      font-size: 16px;
      font-weight: 600;
      color: #c9d1d9;
      margin-bottom: 16px;
    }
    .event-group { margin-bottom: 20px; }
    .event-date-label {
      font-size: 13px;
      color: #8b949e;
      font-weight: 600;
      margin-bottom: 6px;
      padding-bottom: 6px;
      border-bottom: 1px solid #21262d;
    }
    .event-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 9px 0;
      border-bottom: 1px solid #161b22;
      font-size: 14px;
    }
    .event-icon { font-size: 15px; width: 22px; text-align: center; flex-shrink: 0; }
    .event-details { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; line-height: 1.6; }
    .event-action { color: #c9d1d9; }
    .repo-link { color: #58a6ff; font-weight: 600; text-decoration: none; }
    .repo-link:hover { text-decoration: underline; }
    .no-activity { color: #8b949e; font-size: 14px; padding: 12px 0; }
    `],
    providers: [
        { provide: NGX_ECHARTS_CONFIG, useFactory: () => ({ echarts: () => import('echarts') }) }
    ]
})
export class OverviewComponent implements OnInit {
    chartOption: EChartsOption = {};
    totalContributions = 0;
    isLoading = true;
    isLoadingEvents = true;
    hasError = false;
    groupedEvents: GroupedEvent[] = [];
    pinnedRepos: PinnedRepo[] = [];
    skeletonWeeks: number[] = Array.from({ length: 53 });

    username = 'shreeramk';
    currentYear = new Date().getFullYear();
    selectedYear = this.currentYear;
    availableYears: number[] = [];

    getLangColor = getLangColor;

    constructor(
        private githubService: GithubService,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.route.parent?.paramMap.subscribe(params => {
            const u = params.get('username');
            if (u) this.username = u;
            this.init();
        }) ?? this.init();
    }

    private init() {
        // Build year list after fetching user's account creation year
        this.githubService.getUser(this.username).subscribe(user => {
            const createdYear = user.created_at
                ? new Date(user.created_at).getFullYear()
                : this.currentYear - 5;
            this.availableYears = [];
            for (let y = this.currentYear; y >= createdYear; y--) {
                this.availableYears.push(y);
            }
        });

        this.loadContributions(this.selectedYear);
        this.loadEvents();
        this.loadPinnedRepos();
    }

    selectYear(year: number) {
        if (year === this.selectedYear) return;
        this.selectedYear = year;
        this.loadContributions(year);
    }

    private loadContributions(year: number) {
        this.isLoading = true;
        this.hasError = false;
        this.chartOption = {};
        this.githubService.getContributionCalendar(this.username, year).subscribe({
            next: (cal) => {
                if (cal.weeks.length === 0) { this.hasError = true; }
                else { this.buildChart(cal); }
                this.isLoading = false;
            },
            error: () => { this.isLoading = false; this.hasError = true; }
        });
    }

    private loadEvents() {
        this.isLoadingEvents = true;
        this.githubService.getEvents(this.username).subscribe({
            next: (events) => {
                this.groupedEvents = this.groupEventsByDate(events.slice(0, 30));
                this.isLoadingEvents = false;
            },
            error: () => { this.isLoadingEvents = false; }
        });
    }

    private loadPinnedRepos() {
        this.githubService.getPinnedRepos(this.username).subscribe(repos => {
            this.pinnedRepos = repos;
        });
    }

    private buildChart(calendar: ContributionCalendar) {
        this.totalContributions = calendar.totalContributions;

        const heatmapData: [string, number][] = [];
        for (const week of calendar.weeks) {
            for (const day of week.contributionDays) {
                heatmapData.push([day.date, day.contributionCount]);
            }
        }
        if (!heatmapData.length) { this.hasError = true; return; }

        const firstDate = heatmapData[0][0];
        const lastDate = heatmapData[heatmapData.length - 1][0];

        this.chartOption = {
            backgroundColor: 'transparent',
            tooltip: {
                padding: [8, 12],
                backgroundColor: '#1c2128',
                borderColor: '#30363d',
                borderWidth: 1,
                textStyle: { color: '#c9d1d9', fontSize: 12 },
                formatter: (p: any) => {
                    const count = p.data[1];
                    const d = new Date(p.data[0] + 'T00:00:00');
                    const str = d.toLocaleDateString('en-US', {
                        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                    });
                    return count === 0
                        ? `<b>No contributions</b><br/><span style="color:#8b949e">${str}</span>`
                        : `<b>${count} contribution${count > 1 ? 's' : ''}</b><br/><span style="color:#8b949e">${str}</span>`;
                }
            },
            visualMap: {
                min: 0, max: 20, type: 'piecewise', show: false,
                pieces: [
                    { value: 0, color: '#161b22' },
                    { min: 1, max: 3, color: '#0e4429' },
                    { min: 4, max: 6, color: '#006d32' },
                    { min: 7, max: 9, color: '#26a641' },
                    { min: 10, color: '#39d353' }
                ]
            },
            calendar: {
                top: 28, left: 32, right: 6, bottom: 0,
                cellSize: [12, 12],
                range: [firstDate, lastDate],
                itemStyle: {
                    borderWidth: 2,
                    borderColor: '#0d1117',
                    borderRadius: 2,
                    color: '#161b22'
                },
                splitLine: { show: false },
                yearLabel: { show: false },
                dayLabel: {
                    show: true,
                    color: '#8b949e',
                    fontSize: 10,
                    nameMap: ['', 'Mon', '', 'Wed', '', 'Fri', ''],
                    firstDay: 0
                },
                monthLabel: { color: '#8b949e', fontSize: 11, nameMap: 'en' }
            },
            series: [{ type: 'heatmap', coordinateSystem: 'calendar', data: heatmapData }]
        };
    }

    private groupEventsByDate(events: any[]): GroupedEvent[] {
        const map = new Map<string, any[]>();
        for (const e of events) {
            const date = e.created_at?.split('T')[0];
            if (!date) continue;
            if (!map.has(date)) map.set(date, []);
            map.get(date)!.push(e);
        }
        return Array.from(map.entries())
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([date, evts]) => ({ date, events: evts }));
    }

    getEventIcon(type: string): string {
        const m: Record<string, string> = {
            PushEvent: '⬆️', CreateEvent: '✨', DeleteEvent: '🗑️',
            PullRequestEvent: '🔀', PullRequestReviewEvent: '👁️',
            IssuesEvent: '🔵', IssueCommentEvent: '💬',
            WatchEvent: '⭐', ForkEvent: '🍴', ReleaseEvent: '🏷️',
        };
        return m[type] ?? '📌';
    }

    getEventLabel(event: any): string {
        switch (event.type) {
            case 'PushEvent': {
                const n = event.payload?.commits?.length ?? 1;
                return `Pushed ${n} commit${n !== 1 ? 's' : ''} to`;
            }
            case 'CreateEvent': return `Created ${event.payload?.ref_type ?? 'repository'}`;
            case 'DeleteEvent': return `Deleted ${event.payload?.ref_type ?? 'branch'}`;
            case 'PullRequestEvent': return `${this.cap(event.payload?.action ?? 'Opened')} a pull request in`;
            case 'IssuesEvent': return `${this.cap(event.payload?.action ?? 'Opened')} an issue in`;
            case 'IssueCommentEvent': return `Commented on an issue in`;
            case 'WatchEvent': return `Starred`;
            case 'ForkEvent': return `Forked`;
            case 'ReleaseEvent': return `Released ${event.payload?.release?.tag_name ?? ''} in`;
            default: return event.type.replace('Event', '') + ' in';
        }
    }

    private cap(s: string): string {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
}
