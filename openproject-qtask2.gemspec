# encoding: UTF-8
$:.push File.expand_path("../lib", __FILE__)

require 'open_project/qtask2/version'
# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "openproject-qtask2"
  s.version     = OpenProject::Qtask2::VERSION
  s.authors     = "OpenProject GmbH"
  s.email       = "info@openproject.org"
  s.homepage    = "https://community.openproject.org/projects/qtask2"  # TO_DO check this URL
  s.summary     = 'OpenProject Qtask2'
  s.description = "QuickTasks2"
  s.license     = "MIT" # e.g. "MIT" or "GPLv3"

  s.files = Dir["{app,config,db,lib,frontend}/**/*"] + %w(CHANGELOG.md README.md)

  s.add_dependency "rails", "~> 5.0"
end
