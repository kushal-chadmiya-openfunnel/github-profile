import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GitHubUser, GitHubRepo, ContributionCalendar } from '../models/user.model';

export interface PinnedRepo {
    name: string;
    description: string | null;
    url: string;
    primaryLanguage: { name: string; color: string } | null;
    stargazerCount: number;
    forkCount: number;
    isPrivate: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class GithubService {
    private apiUrl = 'https://api.github.com';
    private graphqlUrl = 'https://api.github.com/graphql';

    constructor(private http: HttpClient) { }

    getUser(username: string): Observable<GitHubUser> {
        return this.http.get<GitHubUser>(`${this.apiUrl}/users/${username}`).pipe(
            catchError(err => {
                console.error('GitHub API Error (getUser):', err);
                return of({} as GitHubUser);
            })
        );
    }

    getRepos(username: string): Observable<GitHubRepo[]> {
        return this.http.get<GitHubRepo[]>(
            `${this.apiUrl}/users/${username}/repos?sort=updated&per_page=30`
        ).pipe(
            catchError(err => {
                console.error('GitHub API Error (getRepos):', err);
                return of([]);
            })
        );
    }

    getEvents(username: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/users/${username}/events?per_page=100`).pipe(
            catchError(err => {
                console.error('GitHub API Error (getEvents):', err);
                return of([]);
            })
        );
    }

    /**
     * Fetches the contribution calendar for a given year via GitHub GraphQL API.
     * Requires a token with `read:user` scope.
     * @param username GitHub username
     * @param year  Full year (e.g. 2024). Defaults to current year.
     */
    getContributionCalendar(username: string, year?: number): Observable<ContributionCalendar> {
        const currentYear = new Date().getFullYear();
        const targetYear = year ?? currentYear;
        const isCurrentYear = targetYear === currentYear;

        let from: string;
        let to: string;

        if (isCurrentYear) {
            // Default: last 365 days from today (same as GitHub default view)
            const today = new Date();
            const yearAgo = new Date();
            yearAgo.setFullYear(today.getFullYear() - 1);
            from = yearAgo.toISOString();
            to = today.toISOString();
        } else {
            // Past year: show the full Jan 1 – Dec 31 calendar year
            from = new Date(targetYear, 0, 1, 0, 0, 0).toISOString();   // Jan 1
            to = new Date(targetYear, 11, 31, 23, 59, 59).toISOString(); // Dec 31
        }

        const query = `
            query($username: String!, $from: DateTime!, $to: DateTime!) {
                user(login: $username) {
                    contributionsCollection(from: $from, to: $to) {
                        contributionCalendar {
                            totalContributions
                            weeks {
                                contributionDays {
                                    date
                                    contributionCount
                                    color
                                }
                            }
                        }
                    }
                }
            }
        `;

        return this.http.post<any>(this.graphqlUrl, { query, variables: { username, from, to } }).pipe(
            map(response => {
                const calendar = response?.data?.user?.contributionsCollection?.contributionCalendar;
                if (!calendar) throw new Error('No contribution data in response');
                return calendar as ContributionCalendar;
            }),
            catchError(err => {
                console.error('GitHub GraphQL Error (getContributionCalendar):', err);
                return of({ totalContributions: 0, weeks: [] } as ContributionCalendar);
            })
        );
    }

    /**
     * Fetches pinned repositories via GraphQL.
     * Falls back to top 6 repos by stars if no pins or token missing.
     */
    getPinnedRepos(username: string): Observable<PinnedRepo[]> {
        const query = `
            query($username: String!) {
                user(login: $username) {
                    pinnedItems(first: 6, types: REPOSITORY) {
                        nodes {
                            ... on Repository {
                                name
                                description
                                url
                                primaryLanguage { name color }
                                stargazerCount
                                forkCount
                                isPrivate
                            }
                        }
                    }
                }
            }
        `;

        return this.http.post<any>(this.graphqlUrl, { query, variables: { username } }).pipe(
            map(response => {
                const nodes = response?.data?.user?.pinnedItems?.nodes ?? [];
                return nodes as PinnedRepo[];
            }),
            catchError(() => {
                // Fallback: fetch top repos by stars via REST
                return this.getRepos(username).pipe(
                    map(repos =>
                        repos
                            .sort((a, b) => b.stargazers_count - a.stargazers_count)
                            .slice(0, 6)
                            .map(r => ({
                                name: r.name,
                                description: r.description,
                                url: r.html_url,
                                primaryLanguage: r.language ? { name: r.language, color: '#8b949e' } : null,
                                stargazerCount: r.stargazers_count,
                                forkCount: r.forks_count,
                                isPrivate: r.private
                            } as PinnedRepo))
                    )
                );
            })
        );
    }
}
