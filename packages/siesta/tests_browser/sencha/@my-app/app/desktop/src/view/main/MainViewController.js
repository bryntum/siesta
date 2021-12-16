Ext.define('MyExtGenApp.view.main.MainViewController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.mainviewcontroller',

	routes: { 
		':xtype': {action: 'mainRoute'}
	},

	initViewModel: function(vm){
		vm.getStore('menu').on({
			load: 'onMenuDataLoad',
			single: true,
			scope: this
		});
	},

	onMenuDataLoad: function(store){
		this.mainRoute(Ext.util.History.getHash());
	},

	mainRoute:function(xtype) {
		var navview = this.lookup('navview'),
			menuview = navview.lookup('menuview'),
			centerview = this.lookup('centerview'),
			exists = Ext.ClassManager.getByAlias('widget.' + xtype),
			node, vm;

		if (exists === undefined) {
			console.log(xtype + ' does not exist');
			return;
		}
		if(!menuview.getStore()) {
			console.log('Store not yet avalable from viewModel binding');
			return;
		}

		node = menuview.getStore().findNode('xtype', xtype);

		if (node == null) {
			console.log('unmatchedRoute: ' + xtype);
			return;
		}
		if (!centerview.getComponent(xtype)) {
			centerview.add({ xtype: xtype,  itemId: xtype, heading: node.get('text') });
		}

		centerview.setActiveItem(xtype);
		menuview.setSelection(node);
		vm = this.getViewModel(); 
		vm.set('heading', node.get('text'));
	},

	onMenuViewSelectionChange: function (tree, node) {
		if (node == null) { return }

		var vm = this.getViewModel();

		if (node.get('xtype') != undefined) {
			this.redirectTo( node.get('xtype') );
		}
	},

	onTopViewNavToggle: function () {
		var vm = this.getViewModel();

		vm.set('navCollapsed', !vm.get('navCollapsed'));
	},

	onHeaderViewDetailToggle: function (button) {
		var vm = this.getViewModel();

		vm.set('detailCollapsed', !vm.get('detailCollapsed'));

		if(vm.get('detailCollapsed')===true) {
			button.setIconCls('x-fa fa-arrow-left');
		}
		else {
			button.setIconCls('x-fa fa-arrow-right');
		}
	},

	onBottomViewlogout: function () {
		localStorage.setItem("LoggedIn", false);
		this.getView().destroy();
		Ext.Viewport.add([{ xtype: 'loginview'}]);
	}
});
