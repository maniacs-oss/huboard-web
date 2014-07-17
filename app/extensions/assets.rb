require 'sprockets'

module HuBoard
  module Extensions
    module Assets extend self
      class UnknownAsset < StandardError; end

      module Helpers
        include Sprockets::Helpers

        def asset_pathx(name)
          asset = settings.assets[name]
          raise UnknownAsset, "Unknown asset: #{name}" unless asset
          "#{settings.asset_host}/assets/#{asset.digest_path}"
        end

        def assets_environment
          settings.assets
        end
      end

      def registered(app)
        # Assets
        app.set :assets, assets = Sprockets::Environment.new(app.settings.root)
        app.set :precompile, precompile = %w{ bootstrap.js marketing.js board/application.js marketing.css flex_layout.css application.css splash.css *.png }

        assets.append_path('app/assets/javascripts')
        assets.append_path('app/assets/stylesheets')
        assets.append_path('app/assets/images')
        assets.append_path('vendor/assets/javascripts')
        assets.append_path('vendor/assets/stylesheets')

        app.set :asset_host, ''

        app.configure do

        end

        app.configure :development do
          assets.cache = Sprockets::Cache::FileStore.new('/tmp')
        end

        app.configure :production, :staging do
          assets.cache = Sprockets::Cache::FileStore.new('/tmp')
        end

        app.helpers Helpers
      end
    end
  end
end

