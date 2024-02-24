import { Routes } from '@angular/router';
import { NavigationComponent } from './navigation/navigation.component';
import { GeneralTableComponent } from './general-table/general-table.component';
import { ShortInfoComponent } from './short-info/short-info.component';

export const routes: Routes = [
    { path: "navigation", component: NavigationComponent }, 
    { path: "general-table", component: GeneralTableComponent },
    { path: "short-info", component: ShortInfoComponent } 
];
