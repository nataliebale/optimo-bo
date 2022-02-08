import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
	{
		path: 'sales',
		loadChildren: () =>
			import('./sales/sales-history.module').then((m) => m.SalesHistoryModule),
		data: {
			hotjarEventName: 'Sales',
		}
	},
	// {
	// 	path: 'supplies',
	// 	loadChildren: () =>
	// 		import('./supplies/supplies-history.module').then(
	// 			(m) => m.SuppliesHistoryModule
	// 		),
	// },
	// {
	// 	path: 'sale-orders',
	// 	loadChildren: () =>
	// 		import('./sale-orders/sale-orders-history.module').then(
	// 			(m) => m.SaleOrdersHistoryModule
	// 		),
	// },
	// {
	// 	path: 'prices',
	// 	loadChildren: () =>
	// 		import('./prices/prices-history.module').then(
	// 			(m) => m.PricesHistoryModule
	// 		),
	// },
	{
		path: 'lots',
		loadChildren: () =>
			import('./lots/lots-history.module').then((m) => m.LotsHistoryModule),
		data: {
			hotjarEventName: 'Lots',
		}
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
})
export class HistoriesModule { }
