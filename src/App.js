import Matterport from './components/Matterport.js';
import Menu from './components/Menu.js';
import { SuperViz } from './components/SuperViz.js';

const url = new URL(document.URL);
let userType = url.searchParams.get('user-type');
let roomId = url.searchParams.get('roomId');
let userId = Date.now().toPrecision(20);
let realtime;
let currentContent;

class App {
   constructor() {
      this.contentSection = document.getElementById('content-section');
      this.loaderSection = document.getElementById('loader-section');

      // Pubsub - listen for event: Menu clicked loaded ::
      PubSub.subscribe(Menu.ITEM_CLICKED, this.changeProject.bind(this));

      // Pubsub - listen for event: Matterport loaded ::
      PubSub.subscribe(Matterport.MATTERPORT_LOADED, this.onContentLoaded.bind(this));
   }

   init() {
      // check userType ::
      if (userType == null) userType = 'host';

      // Initilize the SDK ::
      SuperViz.init(userId, roomId === null ? '1' : roomId, ' ', userType);

      // Pubsub - listen for event: When I joined ::
      PubSub.subscribe(SuperViz.MY_PARTICIPANT_JOINED, this.onMyParticipantJoined.bind(this));
   }

   onMyParticipantJoined(e, payload) {
      realtime = payload.realtime;

      // sync engine - listen for event: Matterport model changed ::
      realtime.subscribe(SuperViz.CONTENT_CHANGED, (participant) => {
         if (participant[Object.keys(participant).length - 1].participantId != userId) {
            if (userType != 'host') {
               PubSub.publish(Menu.ITEM_CLICKED, participant[Object.keys(participant).length - 1].data);
            }
         }
      });

      realtime
         .fetchHistory(SuperViz.CONTENT_CHANGED)
         .then((value) => {
            //console.log(value);
            PubSub.publish(Menu.ITEM_CLICKED, value.data);
         })
         .catch(() => {
            PubSub.publish(Menu.ITEM_CLICKED, 'v4LWLiLDm3s');
         });

      // show content ::
      this.loaderSection.classList.add('hide');
      this.contentSection.classList.remove('hide');
   }

   changeProject(e, id) {
      // let sync engine know we updated the content ::
      if (currentContent != id) {
         realtime.publish(SuperViz.CONTENT_CHANGED, id);
      }
   }

   async onContentLoaded(e, payload) {
      //Save content ::
      currentContent = payload.model;
   }
}
export default App;
