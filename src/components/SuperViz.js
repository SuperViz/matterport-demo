import { DEVELOPER_KEY } from '../../env.js';
import Matterport from './Matterport.js';

const SuperViz = (function () {
   // let ::
   let sdk = null;
   let plugin = null;
   let matterportPluginInstance = null;
   // Consts ::
   const MY_PARTICIPANT_JOINED_SDK = 'my_participant_joined';
   const CONTENT_CHANGED_SDK = 'content_changed';

   const initSDK = async function (userId, roomid, name, userType) {
      sdk = await SuperVizSdk.init(DEVELOPER_KEY, {
         group: {
            id: '<GROUP-ID>',
            name: '<GROUP-NAME>',
         },
         participant: {
            id: userId,
            name: name,
            type: userType,
         },
         roomId: roomid,
         defaultAvatars: true,
         environment: 'dev',
         enableFollow: true,
         enableGoTo: true,
         enableGather: true,
         camsOff: false,
         layoutPosition: 'right',
         camerasPosition: 'right',
      });

      // Pubsub - listen for event: Matterport loaded & unloaded ::
      PubSub.subscribe(Matterport.MATTERPORT_LOADED, loadPluginSDK);
      PubSub.subscribe(Matterport.MATTERPORT_DESTROYED, unloadPluginSDK);

      sdk.subscribe(SuperVizSdk.MeetingEvent.MY_PARTICIPANT_JOINED, onMyParticipantJoined);
   };

   const onMyParticipantJoined = function (participant) {
      // publish that I've connected ::
      PubSub.publish(MY_PARTICIPANT_JOINED_SDK, { sdk: sdk, participant: participant });
   };

   const loadPluginSDK = function (e, payload) {
      // App is ready and I'm connected to the SDK. Now init the Plugin ::
      plugin = new window.MatterportPlugin(payload.sdk);

      matterportPluginInstance = sdk.loadPlugin(plugin, {
         avatarConfig: {
            height: 0,
            scale: 1,
            laserOrigin: { x: 0.2, y: -0.2, z: 0 },
         },
         isAvatarsEnabled: true,
         isLaserEnabled: true,
         isNameEnabled: true,
      });
   };

   const unloadPluginSDK = function () {
      sdk.unloadPlugin();
   };

   // Public
   return {
      init: (userId, roomid, name, userType) => initSDK(userId, roomid, name, userType),
      MY_PARTICIPANT_JOINED: MY_PARTICIPANT_JOINED_SDK,
      CONTENT_CHANGED: CONTENT_CHANGED_SDK,
   };
})();

export { SuperViz };
