import { RouterModule, Routes } from '@angular/router';
import { NavigationComponent } from './navigation/navigation.component';
import { GeneralTableComponent } from './general-table/general-table.component';
import { ShortInfoComponent } from './short-info/short-info.component';
import { NgModule } from '@angular/core';

export const routes: Routes = [
    // { path: "navigation", component: NavigationComponent }, 
    { path: "general-table", component: GeneralTableComponent },
    { path: "short-info", component: ShortInfoComponent } 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
