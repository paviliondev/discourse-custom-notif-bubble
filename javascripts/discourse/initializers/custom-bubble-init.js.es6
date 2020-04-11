import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";


export default {
  name: "custom-notif-bubble",
  initialize(container){
    withPluginApi("0.8.33", bubbleEdits);
  }
}

const bubbleEdits = (api) => {
  customUnreadCount(api.getCurrentUser());
  api.reopenWidget('quick-access-notifications', {
    newItemsLoaded() {
      const appEvents = api._lookupContainer('service:app-events');
      appEvents.on('notifications:changed', () => {
        customUnreadCount(this.currentUser);
      });
    },
  });
}

const customUnreadCount = (currentUser) => {
  if(!currentUser) return;
  ajax('/notifications?username='+currentUser.username)
    .then(response => {
      if (!currentUser.enforcedSecondFactor) {
        let notifications = response['notifications'];
        let unread = notifications.filter((notif) => {
              return (![5, 12].includes(notif.notification_type) && !notif.read)
          }).length || 0 ;

          if(unread > currentUser.unread_notifications) {
            currentUser.set("unread_notifications", unread);
          }
      }
    }).catch(popupAjaxError);
};
