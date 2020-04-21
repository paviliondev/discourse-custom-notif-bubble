import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { later } from '@ember/runloop';

export default {
  name: "custom-notif-bubble",
  initialize(container){
    withPluginApi("0.8.33", bubbleEdits);
  }
}

const bubbleEdits = (api) => {
  api.onAppEvent('notifications:changed', () => {
    later(api, function() {
      customUnreadCount(this.getCurrentUser());
    }, 500);
  });
}

const customUnreadCount = (currentUser) => {
  if(!currentUser) return;
  ajax('/notifications?username='+currentUser.username)
    .then(response => {
      if (!currentUser.enforcedSecondFactor) {
        let notifications = response['notifications'];
        let unread = notifications.filter((notif) => {
              return (![5, 6, 12].includes(notif.notification_type) && !notif.read)
          }).length || 0 ;

          if(unread > currentUser.unread_notifications) {
            currentUser.set("unread_notifications", unread);
          }
      }
    }).catch(popupAjaxError);
};
