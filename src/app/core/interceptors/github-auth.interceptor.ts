import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const githubAuthInterceptor: HttpInterceptorFn = (req, next) => {
    if (req.url.includes('api.github.com')) {
        const token = environment.githubToken;
        const headers: { [key: string]: string } = {
            'X-GitHub-Api-Version': '2022-11-28',
            'Accept': 'application/vnd.github+json'
        };
        if (token && token !== 'YOUR_GITHUB_TOKEN_HERE') {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const cloned = req.clone({ setHeaders: headers });
        return next(cloned);
    }
    return next(req);
};
