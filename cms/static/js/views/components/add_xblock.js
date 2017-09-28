/**
 * This is a simple component that renders add buttons for all available XBlock template types.
 */
define(['jquery', 'underscore', 'gettext', 'js/views/baseview', 'common/js/components/utils/view_utils',
        'js/views/components/add_xblock_button', 'js/views/components/add_xblock_menu', 'js/views/utils/xblock_utils'],
    function($, _, gettext, BaseView, ViewUtils, AddXBlockButton, AddXBlockMenu, XBlockViewUtils) {
        var AddXBlockComponent = BaseView.extend({
            events: {
                'click .new-component .new-component-type .multiple-templates': 'showComponentTemplates',
                'click .new-component .new-component-type .single-template': 'createNewComponent',
                'click .new-component .cancel-button': 'closeNewComponent',
                'click .new-component-templates .new-component-template .button-component': 'createNewComponent',
                'click .new-component-templates .cancel-button': 'closeNewComponent',
                'click .new-component .add-unit-button': 'addNewUnit',
                'click .new-component .override-button': 'overrideNudge'
            },

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                that = this;
                this.template = this.loadTemplate('add-xblock-component');
                this.nudgeTemplate = this.loadTemplate('add-xblock-component-nudge');
                this.model.set({number_children: $('.level-element').length});
                this.model.set({overrideNudge: false});
                // this.model.on('change:number_children', function(model){
                //     console.log('number of children changed!');
                //     console.log(model.get('number_children'));
                // }, this.model);
                this.model.on('change:number_children', this.render, this);
                this.model.on('change:overrideNudge', this.render, this);
            },

            overrideNudge: function() {
                this.model.set({overrideNudge: true});
            },

            renderNudge: function() {
                this.$el.html(this.nudgeTemplate());
            },

            renderNormal: function() {
                var that = this;
                this.$el.html(this.template({
                    numberChildren: that.model.get('number_children'),
                    isVertical: that.model.isVertical(),
                    parentId: that.model.get('ancestor_info').ancestors[0].get('id'),
                    defaultNewName: that.model.get('display_name'),
                    overrideNudge: that.model.get('overrideNudge')
                }));
                this.collection.each(
                    function(componentModel) {
                        var view, menu;

                        view = new AddXBlockButton({model: componentModel});
                        that.$el.find('.new-component-type').append(view.render().el);

                        menu = new AddXBlockMenu({model: componentModel});
                        that.$el.append(menu.render().el);
                    }
                );
            },

            render: function() {
                this.renderNormal();
                // if (this.model.get('number_children') > 3) {
                //     this.renderNudge();
                // } else {
                //     this.renderNormal();
                // }
            },

            showComponentTemplates: function(event) {
                var type;
                event.preventDefault();
                event.stopPropagation();
                type = $(event.currentTarget).data('type');
                this.$('.new-component').slideUp(250);
                this.$('.new-component-' + type).slideDown(250);
                this.$('.new-component-' + type + ' div').focus();
            },

            closeNewComponent: function(event) {
                event.preventDefault();
                event.stopPropagation();
                type = $(event.currentTarget).data('type');
                this.$('.new-component').slideDown(250);
                this.$('.new-component-templates').slideUp(250);
                this.$('ul.new-component-type li button[data-type=' + type + ']').focus();
            },

            createNewComponent: function(event) {
                var self = this,
                    element = $(event.currentTarget),
                    saveData = element.data(),
                    oldOffset = ViewUtils.getScrollOffset(this.$el);
                event.preventDefault();
                this.closeNewComponent(event);
                ViewUtils.runOperationShowingMessage(
                    gettext('Adding'),
                    _.bind(this.options.createComponent, this, saveData, element)
                ).success(function(){
                    self.model.set({number_children: self.model.get('number_children') + 1});
                }).always(function() {
                    // Restore the scroll position of the buttons so that the new
                    // component appears above them.
                    ViewUtils.setScrollOffset(self.$el, oldOffset);
                });
            },

            addNewUnit: function(event) {
                var $target = $(event.currentTarget);
                console.log($target);
                    // category = $target.data('category');
                event.preventDefault();
                XBlockViewUtils.addXBlock($target).done(function(locator) {
                    ViewUtils.redirect('/container/' + locator + '?action=new')
                });
            }
        });

        return AddXBlockComponent;
    }); // end define();
