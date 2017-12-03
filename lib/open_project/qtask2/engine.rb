# Prevent load-order problems in case openproject-plugins is listed after a plugin in the Gemfile
# or not at all
require 'open_project/plugins'

module OpenProject::Qtask2
  class Engine < ::Rails::Engine
    engine_name :openproject_qtask2

    include OpenProject::Plugins::ActsAsOpEngine

    register( 'openproject-qtask2',
             :author_url => 'https://openproject.org',
             :requires_openproject => '>= 7.3.0'
    ) do

      project_module :qtask_module do
        permission :view_qtask, { qtask: [:index] }
      end

      menu :project_menu,
          :qtask,
          { controller: 'qtask', action: 'index'},
          after: :overview,
          param: :project_id,
          caption: "Quick task",
          icon: 'icon2 icon-time',
          html: { id: "qtask-menu-item" },
          if: ->(project) { true }

    end

    assets %w(qtask.css)

  end
end
