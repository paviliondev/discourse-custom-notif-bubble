import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "custom-notif-bubble",
  initialize(container){
    withPluginApi("0.8.33", bubbleEdits);
  }
}

const bubbleEdits = (api) => {
  api.reopenWidget('quick-access-notifications', {
    newItemsLoaded() {
      if (!this.currentUser.enforcedSecondFactor) {
        this.currentUser.set("unread_notifications", this.customUnreadCount());
      }
      const appEvents = api._lookupContainer('service:app-events');
      appEvents.on('notifications:changed', () => {
        let currentUser = this.currentUser;
        if(this.customUnreadCount() > currentUser.get('unread_notifications')) {
          currentUser.set("unread_notifications", this.customUnreadCount());
        }
      });
    },
    customUnreadCount(){
      return this.getItems().filter((notif) => {
          return (![5, 12].includes(notif.notification_type) && !notif.read)
      }).length || 0 ;
    },
  });
} 