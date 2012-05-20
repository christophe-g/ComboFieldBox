/**
 *   ComboView
 */
 Ext.define('Ext.ux.ComboView',
    {extend : 'Ext.view.View', 
         alias : 'widget.comboview', 
    /**
      * @cfg {Boolean} maxLength
      * maximum length for viewItems. If text is longer, it gets 'ellipsisied'.  
      */
    maxLength: 18,
    /**
      * @cfg {Boolean} removeOnDblClick
      * true to unselect viewItem on double click  
      */
    removeOnDblClick: true,
    /**
      * @cfg {Boolean} inputWidth
      * width for the inputfield  
      */
    inputWidth: 40,
    itemSelector: 'li.x-boxselect-item',
    closeCls: 'x-boxselect-item-close',
     /**
     * Set Xtemplate fot the ComboView (called if me.tpl is not existing)
     * @returns {Ext.XTemplate} Returns template 
     */
    setTpl: function() {
    	 var me = this,
            field = me.field,
            displayField = field.displayField,
            descField = field.descField,
            iconClsField = field.iconClsField;
        me.tpl = new Ext.XTemplate(
            '<ul class="x-boxselect-list {fieldCls} {typeCls}">',
                '{[this.empty(values)]}',
                '<tpl for=".">', 
                    '<li class="x-boxselect-item ', 
                    iconClsField ? ('x-boxselect-icon {' + iconClsField + '}"') : '"', 
                    descField ? ('data-qtitle="{' + displayField + '}" data-qtip="{' + descField + '}">') : '>', 
                    '<div class="x-tab-close-btn ', me.closeCls, '"></div>', 
                    '<div class="x-boxselect-item-text">{[this.ellipsis(values.', displayField, ')]}</div>', 
                    '<div class="x-tab-close-btn ', me.closeCls, '"></div>', 
                '</li>', 
            '</tpl>', 
			'<li class="x-boxselect-input"><input style="width:10px;"/></li>', // need this to manage focus; width of input is larger in createNewOnEnter is set to true
        '</ul>', {
            compiled: true,
            disableFormats: true,
            length: me.maxLength,
            ellipsis: function (txt) {
                return Ext.String.ellipsis(txt, this.length)
            },
            emptyText: me.emptyText,
            empty : function(values) {
                return   '<span class="empty">' + (values.length  ? '' : this.emptyText )+ '</span>' 
            }
        })
        delete me.emptyText;
        return me.tpl;
    },
    initComponent: function () {
        var me = this;
        if (!me.tpl) {me.tpl= me.setTpl()};
        if (!me.selModel) {
            me.selModel = {enableKeyNav: false};
        }
        me.callParent(arguments)
    },
    renderSelectors: {
        inputEl: 'input',
        emptyEl: 'span.empty'
    },
    getFocusEl: function () {
        return this.inputEl
    },
   addFocusListener: function (force) {
        var me = this,  focusEl;
        if (!me.focusListenerAdded) {
            me.callParent(); // force argument only valid in ComboView
                me.field.el.on({
                    click: me.field.onFocus,
                    scope: me.field
                })
        }
        if ((focusEl = me.getFocusEl()) && force) {
            focusEl.on({
                focus: me.field.onFocus,
                blur: me.field.onBlur,
                scope: me.field
            });
       }
    }, 
    onItemClick: function (r, h, i, e, o) {
        if (e.getTarget('.' + this.closeCls)) {
            return this.onDataChange(r, 'remove')
        }
        this.highlightItem(h)
    },
    onItemDblClick: function (r, h, i, e, o) {
        if (this.removeOnDblClick) {
            this.onDataChange(r, 'remove')
        }
    },
    onDataChange: function (r, action) {
        var me = this;
        if(me.field.readOnly || me.field.disabled) {return}
        if (action == 'remove') {
            me.store.remove(r)
        }
        me.field.setStoreValues()
    },
    listeners: {
        refresh: {
            fn: function () { 
            	var me = this;
	               	 this.applyRenderSelectors();
    	            this.addFocusListener(this);
            }
        }
    },
    onDestroy: function () {
        var me = this,
            focusEl;
        if (focusEl = me.getFocusEl()) {
            focusEl.clearListeners()
        }
    }
/*::::*/
});



