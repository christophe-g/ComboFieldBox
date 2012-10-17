/**
 *   ComboFieldBox
 */
Ext.define('Ext.ux.ComboFieldBox', {
    extend : 'Ext.form.field.ComboBox',
	alias : 'widget.combofieldbox', 
	requires: ['Ext.ux.ComboView'],
	multiSelect: true,
	/**
 	 * @cfg
	 * maximum height for inputEl. 
	 */
	maxHeight: 150,
	/**
	 * @cfg
	 * name of field used for description/tooltip
	 */
	descField: null,
	/**
	 * @cfg
	 * config object passed to the view 
	 * viewCfg: {},
	 */
	/**
	 * @cfg {String} iconClsField
	 * The underlying iconCls field name to bind to this ComboBox.
	 * iconClsField: '',
	 */
	/**
	 * @cfg {Boolean} createNewOnEnter
	 * When forceSelection is false, new records can be created by the user. This configuration
	 * option has no effect if forceSelection is true, which is the default.
	 */
	createNewOnEnter: false,
	/**
	 * @cfg {Boolean} forceSelection
	 * override parent config. If force selection is set to false and    
	 */
	forceSelection: true, 
	/**
	 * @cfg {Boolean} selectOnTab
	 * Whether the Tab key should select the currently highlighted item.
	 */
	selectOnTab : false,
	/**
	 * @cfg {String} trigger1Cls
	 * css class for the first trigger. To have just one trigger acting like in usual combo, set trigger1Cls to null. First trigger clears all values
	 */
	trigger1Cls	: Ext.baseCSSPrefix + 'form-clear-trigger',
	/**
	 * @cfg {String} trigger2Cls
	 * css class for the second trigger. To have just one trigger, set trigger1Cls to null.
	 */
	trigger2Cls	: Ext.baseCSSPrefix + 'form-combo-trigger',
	
	/**
	 * @cfg {String} listIconCls
	 * css class to use when an iconClsField is set. This class is injected into getInnerTpl method when constructing the comboBox boundList
	 */
    listIconCls : 'x-boundlist-icon',
    /**
	 * @cfg {String} delimiter
	 * string delimiter. default ' ' overrides parent class ', '. Used in setvalue (if value is a string) to split values. 
	 */
    delimiter: ' ',
    fieldSubTpl: [
        '<div class="{hiddenDataCls}" role="presentation"></div>',
        '<div id="{id}"',
            '<tpl if="readOnly"> readonly="readonly"</tpl>',
            '<tpl if="disabled"> disabled="disabled"</tpl>',
            '<tpl if="tabIdx"> tabIndex="{tabIdx}"</tpl>',
            '<tpl if="name"> name="{name}"</tpl>',
            '<tpl if="fieldStyle"> style="{fieldStyle}"</tpl>',
            '<tpl if="placeholder"> placeholder="{placeholder}"</tpl>',
            '<tpl if="size"> size="{size}"</tpl>',
            'class="{fieldCls} {typeCls} x-boxselect" autocomplete="off" />',
        '</div>',
    {
        compiled: true,
        disableFormats: true
    }
    ],
    getSubTplData: function () {
        var me = this,
            fieldStyle = me.getFieldStyle(),
            ret = me.callParent(arguments);
        ret.fieldStyle = (fieldStyle || '') + ';overflow:auto;height:'+ (me.height ? (me.height + 'px;') : 'auto;') + (me.maxHeight ? ('max-height:' + me.maxHeight + 'px;') : '');
        delete me.height; //need to delete height for the correct component height to be recalculated on layout. 
        return ret;
    },
    alignPicker: function () {
        var me = this,
            picker = me.getPicker(),
            w =  me.triggerWidth;  
        me.callParent(arguments);
        if (me.isExpanded && me.matchFieldWidth) {
            picker.setWidth(me.bodyEl.getWidth() -  (me.trigger2Cls ? (2 * w) : w));
        }
    },
    initComponent: function () {
        var me = this;
        if(!me.trigger1Cls) {
        	me.onTrigger1Click = null;
        	me.trigger2Cls = null;
        }
        me.bindStore(me.store || 'ext-empty-store', true);
        me.getValueStore();
       	var selModel = me.multiSelect ? {selModel: {mode: 'SIMPLE', enableKeyNav: false}} : {selModel: {mode: 'SINGLE',enableKeyNav: false}};
        me.listConfig = Ext.apply(me.listConfig || {}, selModel);
        if(me.iconClsField || me.descField) {
            Ext.apply(me.listConfig, {
                getInnerTpl: function(displayField) {
                    return '<div data-qtip="{' +me.descField +'}" class="'+ ((me.iconClsField && me.listIconCls) ? me.listIconCls :'') +' {'+me.iconClsField + '}">{' + me.displayField +'}</div>';
                }
            });
        }
        me.rawValue = me.value;
        me.callParent(arguments);
    },
    onTrigger1Click : function() {
    	var me = this;
    	me.setValue("");
		me.collapse();
    },
    setValueStore: function(store) {
        this.valueStore = store;
    },
    getValueStore: function() {
        var me = this;
        return me.valueStore || (me.valueStore = me.createValueStore());
    },
    createValueStore: function() {
        return this.valueStore = new Ext.data.Store({
            model: this.store.model
        });
    },
    /**
    * get all field values from value store and re-set combobox values
    */
    setStoreValues: function() {
        var me = this, 
            st = me.getValueStore();
        me.setValue(st.data.extractValues(me.valueField || st.valueField, 'data'));
        me.syncSelection();   
    },
    getValueModels: function () {
        return this.valueModels || [];
    },
    afterSetValue: function (){
        var me = this;
	    me.valueStore.removeAll();
		me.valueStore.add(me.getValueModels());
		if (me.isExpanded) {
			me.alignPicker();
		}
		me.syncSelection();
	   	me.updateLayout();
	},
	assertValue: Ext.emptyFn,
    setValue: function (value, action) {
        var me = this,
        	st = me.store;
        if(Ext.isString(value)) {value = value.split(me.delimiter)};
        if(me.tempValue) {
    	    var picker = me.getPicker(),
	        	oldPr = picker.preserveScrollOnRefresh;
			value = Ext.Array.unique(value.concat(me.tempValue));
        	var val = me.store.data.extractValues(me.valueField, 'data');
			if(me.typeAhead && (me.store.getCount() == 1)) {
				var v = me.store.getAt(0).get(me.valueField);
				me.tempMulti != true ? value = [v] : value.push(v);
				me._needCollapse = true;
			}
			me.store.data.addAll(Ext.Array.filter(me.valueStore.data.items, function(i) {return (Ext.Array.indexOf(val,i.data[me.valueField]) < 0)}));
			picker.preserveScrollOnRefresh = true;
			if(me.picker.refresh) {me.picker.refresh()}
        	picker.preserveScrollOnRefresh = oldPr;
        }
        me.callParent([value, false]);
        me.value = value; // need to reset the value here: in case the store is not yeat loaded and multiSelect == true, me.value is set to [] during the callParent. 
        if(st.getCount() > 0 ) {return me.afterSetValue()}
        if(!st.isLoading() && me._isStoreLoadCalled !== true) {
            st.load();
            me._isStoreLoadCalled = true;
        }
        st.on('load', me.afterSetValue, me, {single: true});
    },
    getRawValue: function () {
        return Ext.value(this.rawValue, '');
    },
    doRawQuery: function() {
     	var me = this,
			qe;
     	if(me.view && me.typeAhead && (qe = me.view.inputEl.getValue())) {
	    	me.tempValue = me.value;
	    	me.tempMulti = me.multiSelect;
	    	me.multiSelect = true; 
	    	this.doQuery(qe, false, true);
	    	me.multiSelect = me.tempMulti; 
	        delete me.tempMulti;
			if(me._needCollapse){
				me.collapse();
		        delete me._needCollapse;				
			}
	        else {
				me.onExpand();
				me._preventClear = true;
				me.view.inputEl.focus();
				me.view.inputEl.dom.value=qe;
				delete me._preventClear;
	        }
	        delete me.tempValue;
		}
    },
    onBlur: function() {
    	var me = this;
    	me.view.inputEl.dom.value ='';
    	me.view.inputEl.setWidth(10);
    	if(me.view.emptyEl) {me.view.emptyEl.show()};
    	if(me.picker && me.isExpanded && me._preventCollapse != true) {me.onTriggerClick()};
    }, 
    onFocus: function() {
    	var me = this,
    		view = me.view;
    	me.callParent(arguments);
    	view.inputEl.setWidth(view.inputWidth);
   		if(me._preventClear != true) {
	    	me.store.clearFilter();
	    	if(me.picker && me.picker.refresh) {me.picker.refresh()}
    	}
    	if(view.emptyEl) {
	    	view.emptyEl.setVisibilityMode(Ext.dom.AbstractElement.DISPLAY);
    		view.emptyEl.hide()
    	}
    	me.view.focus();
    },
    
    buildKeyNav: function() {
    	 var me = this,
            selectOnTab = me.selectOnTab,
            picker = me.getPicker();
		return  new Ext.view.BoundListKeyNav(picker.el, {
                boundList: picker,
                forceKeyDown: true,
                tab: function(e) {
                    if (selectOnTab || (me.typeAhead &&  (me.view.inputEl.dom.value || me.tempValue)) ) { 
                        this.selectHighlighted(e);
                    }
                   	me.onTriggerClick();
					return true
                }, 
                esc: function(e) {
                	me.onTriggerClick()
                }
            });
    },
  	onExpand: function() {
        var me = this,
            keyNav = me.listKeyNav,
            selectOnTab = me.selectOnTab,
            node,
            picker = me.getPicker();
        // Handle BoundList navigation from the input field. Insert a tab listener specially to enable selectOnTab.
        if(!keyNav){ keyNav = me.listKeyNav = me.buildKeyNav(); }
        // While list is expanded, stop tab monitoring from Ext.form.field.Trigger so it doesn't short-circuit selectOnTab
        if (selectOnTab) {
          me.ignoreMonitorTab = true;
       	}
        Ext.defer(keyNav.enable, 3, keyNav); //wait a bit so it doesn't react to the down arrow opening the picker
        me.highlightFirstNode()
       
    },
    highlightFirstNode: function(select) {
    	var me = this,
    		picker =  me.getPicker();
    	me._preventCollapse = true;
        picker.focus();
        delete me.preventCollapse;
        if(picker.getNode && (node = picker.getNode(0))){
            picker.highlightItem(node);
        }
    	
    },
    onCollapse: function() {
    	var me = this;
    	me.callParent(arguments);
    	me.view.focus();
    },
    createRecord: function(rawValue) {
   		var me= this, rec = {}, val = rawValue.split(me.delimiter).join('') ;
		rec[me.valueField] = rawValue;
		rec[me.displayField] = rawValue;
		return rec
    },
    afterComponentLayout : function() {
        var me = this;
        me.callParent(arguments);
        if (!me.view) {
        	var selectBoxOnTab = me.selectBoxOnTab,
            del = function(e) {
            	if(me.readOnly || me.disabled || !me.editable || me.view.inputEl.dom.value ) {return}
                var selected = selModel.getSelection()[0];
                if(selected) {
	                var idx = Ext.Array.indexOf(me.view,me.view.getNode(selected));
	                selModel.onNavKey.call(selModel, 1);
	                me.getValueStore().remove(selected);
					me.setStoreValues();
					selModel.select(idx);
	                me.view.focus()
                }
                return true;
            };
            me.view = new Ext.ux.ComboView(Ext.apply({
                store: me.valueStore,
                emptyText: me.emptyText || '',
                field: me,
                renderTo: me.inputEl
            }, me.viewCfg));
           var selModel = me.view.selModel; 
           var boxKeyNav=  me.boxKeyNav = new Ext.view.BoundListKeyNav(me.view.el, {
                boundList: me.view,
                forceKeyDown: true,
                down : function(e) {
                	if(me.isExpanded && me.view.inputEl.getValue()) {return me.picker.focus()}
                	me.onTriggerClick();
                },
                right: function(e) {
                	selModel.onNavKey.call(selModel, +1)	
                },
                left: function(e) {
	                selModel.onNavKey.call(selModel, -1)
                },
                enter: function(e) {
                	if(me.readOnly || me.disabled || !me.editable) {return}
					if (me.multiSelect && me.createNewOnEnter == true && e.getKey() == e.ENTER  && (rawValue = e.target.value) && (!Ext.isEmpty(rawValue))) {
						 var rec = me.store.findExact(me.valueField, rawValue);
						 if(rec < 0) {
							rec= me.store.add(me.createRecord(rawValue));
						 }
						 me.getValueStore().add(rec);
						 me.setStoreValues();
					}
					me.view.focus();
                },
                tab: function(e) {
                	if(me.isExpanded && e.target.value ){
						me.highlightFirstNode();
						if(me.typeAhead) {
							me.listKeyNav.selectHighlighted(e)
						}
                	}
                	return true
                },
                del: del,
                space: del
            });
            Ext.defer(boxKeyNav.enable, 1, boxKeyNav);
        }
    },
    onDestroy: function() {
        var me = this;
        if(me.view) {
            Ext.destroy(me.view, me.boxKeyNav);
        }
        me.callParent(arguments);
    }
});
