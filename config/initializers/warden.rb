Warden::GitHub::Rails.setup do |config|
  config.add_scope :default,  
    client_id:     ENV["GITHUB_CLIENT_ID"],
    client_secret: ENV["GITHUB_SECRET"],
    scope:         'public_repo'

  config.add_scope :private, 
    client_id:     ENV["GITHUB_CLIENT_ID"],
    client_secret: ENV["GITHUB_SECRET"],
    scope:         'repo'

  config.default_scope = :default
end