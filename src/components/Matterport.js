import { SuperViz } from './SuperViz.js';
import Menu from './Menu.js';
import { MATTERPORT_KEY } from '../../env.js';

export const MATTERPORT_LOADED = 'matterport_loaded';
export const MATTERPORT_DESTROYED = 'matterport_destroyed';

let model = null;
let showcase = null;
let sdk = null;
let loadListener = null;

class Matterport {
   constructor() {
      this.contentSection = document.getElementById('content-section');
      // Pubsub - listen for event: When I joined ::
      PubSub.subscribe(SuperViz.MY_PARTICIPANT_JOINED, this.onMyParticipantJoined.bind(this));
   }

   onMyParticipantJoined(e, payload) {
      // only render menu if i'm the host
      PubSub.subscribe(Menu.ITEM_CLICKED, this.changeProject.bind(this));
   }

   async changeProject(e, id) {
      if (model != id) {
         await this.destroyMatterport();
         PubSub.publish(MATTERPORT_DESTROYED, '');
         this.createElement(id);
      } else {
         console.log('model already loaded inside MP');
      }
   }

   createElement(content) {
      showcase = document.createElement('iframe');
      model = content;

      showcase.setAttribute('id', 'showcase');
      showcase.setAttribute('height', '100%');
      showcase.setAttribute('width', '100%');
      showcase.setAttribute('allow', 'xr-spatial-tracking');
      showcase.style.border = 'none';

      this.contentSection.appendChild(showcase);
      showcase.setAttribute('src', this.buildUrl(content));

      loadListener = this.onShowcaseLoad.bind(this);

      showcase.addEventListener('load', loadListener);
   }

   buildUrl(content) {
      const url = new URL(`${window.location.origin}/modules/matterport/matterport_bundle/showcase.html`);

      url.searchParams.set('applicationKey', MATTERPORT_KEY);
      url.searchParams.set('m', content);
      url.searchParams.set('play', 1);
      url.searchParams.set('search', 0);
      url.searchParams.set('vr', 0);
      url.searchParams.set('qs', 1);
      url.searchParams.set('hr', 0);
      url.searchParams.set('kb', 0);

      return url.toString();
   }

   async onShowcaseLoad() {
      const iframe = document.getElementById('showcase');
      const MP_SDK = iframe.contentWindow.MP_SDK;

      try {
         sdk = await MP_SDK.connect(iframe, MATTERPORT_KEY, '').then(this.onShowcaseConnect).catch(console.error);
      } catch (e) {
         console.error(e);
         return;
      }
   }

   async onShowcaseConnect(e) {
      PubSub.publish(MATTERPORT_LOADED, { sdk: e, model: model });
   }

   destroyMatterport() {
      if (!sdk) return;
      sdk.disconnect();
      if (!showcase) return;

      showcase.removeEventListener('load', loadListener);

      return new Promise((resolve) => {
         setTimeout(() => {
            showcase.src = 'about:blank';
            setTimeout(() => {
               showcase.remove(showcase);
               resolve();
            }, 1000);
         }, 1000);
      });
   }

   static get MATTERPORT_LOADED() {
      return MATTERPORT_LOADED;
   }
   static get MATTERPORT_DESTROYED() {
      return MATTERPORT_DESTROYED;
   }
}
export default Matterport;
