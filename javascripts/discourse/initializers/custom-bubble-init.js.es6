import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { later } from '@ember/runloop';
import { h } from "virtual-dom";
import Session from "discourse/models/session";

export default {
  name: "custom-notif-bubble",
  initialize(container){
    withPluginApi("0.8.33", bubbleEdits);
  }
}

const bubbleEdits = (api) => {

  api.reopenWidget('quick-access-notifications', {
    defaultState(){
      const def = this._super();
      def['filter'] = 'latest';
      return def;
    },

    newItemsLoaded() {
      if(this.hasUnread()) {
        let unreadCount = this.getItems()
                              .filterBy('read', false)
                              .filter((item) =>
                               ![5, 6, 12, 19, 24].includes(item.notification_type))
                              .length;
        this.currentUser.set("unread_notifications", unreadCount)
      }
    },

    getItems() {
      let items =  Session.currentProp(`${this.key}-items`) || [];
      if(this.state['filter'] && this.state['filter'] === 'unread') {
        items = items.filter(item => !item.read);
      }
      return items.slice(0, 15);
    },

    updateFilter(filter){
      this.notifState['filter'] = filter['id'];
    },

    _findStaleItemsInStore() {
      return this.store.findStale(
        "notification",
        { read: false },
        { cacheKey: "recent-notifications" }
      );
    }
  });
}
