import { DEVELOPER_KEY } from '../../env.js';
import Matterport from './Matterport.js';

const SuperViz = (function () {
   // let ::
   let room = null;
   let video = null;
   let plugin = null;
   let realtime = null;
   let matterportPresence = null;
   let type = null;
   // Consts ::
   const MY_PARTICIPANT_JOINED_SDK = 'my_participant_joined';
   const CONTENT_CHANGED_SDK = 'content_changed';

   const initSDK = async function (userId, roomid, name, userType) {
      room = await window.SuperVizRoom.init(DEVELOPER_KEY, {
         roomId: roomid,
         group: {
            id: '<GROUP-ID>',
            name: '<GROUP-NAME>',
         },
         participant: {
            id: userId,
            name: name,
         },
         environment: 'dev',
      });
      type = userType;

      realtime = new window.SuperVizRoom.Realtime();
      realtime.subscribe(SuperVizRoom.RealtimeComponentEvent.REALTIME_STATE_CHANGED, onRealtimeInitiated);

      room.addComponent(realtime);

      PubSub.subscribe(Matterport.MATTERPORT_LOADED, loadPluginSDK);
   };

   const onRealtimeInitiated = function (state) {
      video = new window.SuperVizRoom.VideoConference({
         userType: type,
         defaultAvatars: true,
         enableFollow: true,
         enableGather: true,
         enableGoTo: true,
         collaborationMode: {
            modalPosition: 'center',
         },
      });

      room.addComponent(video);

      video.subscribe(SuperVizRoom.MeetingEvent.MY_PARTICIPANT_JOINED, onMyParticipantJoined);
      video.subscribe(SuperVizRoom.MeetingEvent.MY_PARTICIPANT_LEFT, onMyParticipantLeft);
   };

   const onMyParticipantJoined = function (participant) {
      PubSub.publish(MY_PARTICIPANT_JOINED_SDK, { realtime: realtime, participant: participant });
      // publish that I've connected ::
   };

   const loadPluginSDK = function (e, payload) {
      // App is ready and I'm connected to the SDK. Now init the Plugin ::

      matterportPresence = new Presence3D(payload.sdk, {
         avatarConfig: {},
         isAvatarsEnabled: true,
         isLaserEnabled: true,
         isNameEnabled: true,
      });

      room.addComponent(matterportPresence);
   };

   const onMyParticipantLeft = function () {
      room.removeComponent(video);
      room.removeComponent(matterportPresence);
   };

   // Public
   return {
      init: (userId, roomid, name, userType) => initSDK(userId, roomid, name, userType),
      MY_PARTICIPANT_JOINED: MY_PARTICIPANT_JOINED_SDK,
      CONTENT_CHANGED: CONTENT_CHANGED_SDK,
   };
})();

export { SuperViz };
