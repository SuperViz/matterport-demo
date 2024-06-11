import Matterport from "./components/Matterport.js";
import Menu from "./components/Menu.js";
import { SuperViz } from "./components/SuperViz.js";

const url = new URL(document.URL);
let userType = url.searchParams.get("user-type");
let roomId = url.searchParams.get("roomId");
let userId = Date.now().toPrecision(20);
let realtime;
let mainChannel;
let currentContent;
let defaultModel = "v4LWLiLDm3s";

class App {
  constructor() {
    this.contentSection = document.getElementById("content-section");
    this.loaderSection = document.getElementById("loader-section");

    // Pubsub - listen for event: Menu clicked loaded ::
    PubSub.subscribe(Menu.ITEM_CLICKED, this.changeProject.bind(this));

    // Pubsub - listen for event: Matterport loaded ::
    PubSub.subscribe(
      Matterport.MATTERPORT_LOADED,
      this.onContentLoaded.bind(this)
    );
  }

  init() {
    // check userType ::
    if (userType == null) userType = "host";

    // Initilize the SDK ::
    SuperViz.init(userId, roomId === null ? "1" : roomId, " ", userType);

    // Pubsub - listen for event: When I joined ::
    PubSub.subscribe(
      SuperViz.MY_PARTICIPANT_JOINED,
      this.onMyParticipantJoined.bind(this)
    );
  }

  onMyParticipantJoined(e, payload) {
    realtime = payload.realtime;
    mainChannel = payload.channel;

    // subscribe to real-time "SuperViz.CONTENT_CHANGED_IN_CHANNEL" events ::
    mainChannel.subscribe(SuperViz.CONTENT_CHANGED_IN_CHANNEL, (payload) => {
      // don't do anything if tour is already there ::
      if (currentContent === payload.data) return;

      // if it was not me who changed the content, go ahead and change it ::
      if (payload.participantId != userId)
        PubSub.publish(SuperViz.CHANGE_CONTENT, payload.data);
    });

    mainChannel
      .fetchHistory(SuperViz.CONTENT_CHANGED_IN_CHANNEL)
      .then((value) => {
        // get the model current model in the real-time "SuperViz.CONTENT_CHANGED_IN_CHANNEL" channel ::
        currentContent = value[value.length - 1].data;

        // publish to internal pubsub that we should load new content ::
        if (currentContent == undefined)
          PubSub.publish("load_content", defaultModel);
        else PubSub.publish(SuperViz.CHANGE_CONTENT, currentContent);
      })
      .catch(() => {
        PubSub.publish(SuperViz.CHANGE_CONTENT, defaultModel);
      });

    // show content ::
    this.loaderSection.classList.add("hide");
    this.contentSection.classList.remove("hide");
  }

  changeProject(e, id) {
    if (currentContent != id) {
      // let internal engine know we updated the content ::
      PubSub.publish(SuperViz.CHANGE_CONTENT, id);

      // let real-time channel know we updated the content ::
      mainChannel.publish(SuperViz.CONTENT_CHANGED_IN_CHANNEL, id);
    }
  }

  async onContentLoaded(e, payload) {
    //Save content ::
    currentContent = payload.model;
  }
}
export default App;
