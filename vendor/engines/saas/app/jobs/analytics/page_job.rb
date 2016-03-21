module Analytics
  class PageJob < AnalyticsJob
    action "page"

    def payload(params)
      user = params['current_user'] ? params['current_user']['id'] : "Anonymous"
      {
        user_id: user,
        name: params['url'],
        properties: { url: params['url'] }
      }
    end
  end
end
