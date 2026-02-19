import { Routes } from '@angular/router';
import { ProfileLayoutComponent } from './features/profile/profile-layout/profile-layout.component';
import { OverviewComponent } from './features/profile/overview/overview.component';
import { RepositoriesComponent } from './features/profile/repositories/repositories.component';
import { PlaceholderComponent } from './core/components/placeholder/placeholder.component';

export const routes: Routes = [
    {
        path: ':username',
        component: ProfileLayoutComponent,
        children: [
            { path: 'overview', component: OverviewComponent },
            { path: 'repositories', component: RepositoriesComponent },
            { path: 'projects', component: PlaceholderComponent },
            { path: 'packages', component: PlaceholderComponent },
            { path: 'stars', component: PlaceholderComponent },
            { path: '', redirectTo: 'overview', pathMatch: 'full' }
        ]
    },
    {
        path: '',
        redirectTo: 'kushal-chadmiya-openfunnel', // Updated to match user in screenshot
        pathMatch: 'full'
    }
];
