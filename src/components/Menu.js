import Matterport from './Matterport.js';
import { SuperViz } from './SuperViz.js';

export const ITEM_CLICKED = 'item_clicked';

const content = `
   <div class='projects'>
      <div class='title'>PROJECTS</div>
      <div id='projects-button' class='collapse-button'></div>
   </div>
   <div class='demo'>
      <div id='projects-list'>
         <a id='v4LWLiLDm3s' class='link'>
            <div class='project-thumb'>
               <img src='https://my.matterport.com/api/v1/player/models/v4LWLiLDm3s/thumb?width=1403&dpr=2&disable=upscale' />
            </div>
            <div class='project-name'>Explore The Elms in 3D</div>
         </a>
         <a id='zWpt6DAXDJw' class='link'>
            <div class='project-thumb'>
               <img src='https://my.matterport.com/api/v1/player/models/zWpt6DAXDJw/thumb?width=1083&dpr=2&disable=upscale' />
            </div>
            <div class='project-name'>Explore Warehouse Virtual Staging in 3D</div>
         </a>
         <a id='KSParQVSEKy' class='link'>
            <div class='project-thumb'>
               <img src='https://my.matterport.com/api/v1/player/models/KSParQVSEKy/thumb?width=1083&dpr=2&disable=upscale' />
            </div>
            <div class='project-name'>Explore Casa Nostra in 3D</div>
         </a>
         <a id='toTRYzoAMdT' class='link'>
            <div class='project-thumb'>
               <img src='https://my.matterport.com/api/v1/player/models/toTRYzoAMdT/thumb?width=1083&dpr=2&disable=upscale' />
            </div>
            <div class='project-name'>Explore Cauley Ferrari in 3D</div>
         </a>
      </div>
   </div>`;

class Menu {
   constructor() {
      this.menuElement = document.getElementById('menu');
      this.clickHandlers = new Array();

      // Pubsub - listen for event: When I joined ::
      PubSub.subscribe(SuperViz.MY_PARTICIPANT_JOINED, this.onMyParticipantJoined.bind(this));
   }

   onMyParticipantJoined(e, payload) {
      // only render menu if i'm the host
      if (payload.participant.type === 'host') this.init();
   }

   init() {
      this.menuElement.innerHTML = content;
      this.contentArea = document.getElementById('content-section');
      this.projectsButton = document.getElementById('projects-button');
      this.projectsList = document.getElementById('projects-list');
      this.items = this.projectsList.getElementsByTagName('a');

      // click handler on open menu ::
      this.projectsButton.addEventListener('click', this.onProjectsButtonClicked.bind(this));

      // Pubsub - listen for event: Matterport loaded ::
      PubSub.subscribe(Matterport.MATTERPORT_LOADED, this.onContentLoaded.bind(this));
   }

   setActive(id) {
      // Remove any active ::
      for (var i = 0; i < this.items.length; i++) {
         this.items[i].getElementsByClassName('project-name')[0].classList.remove('active');
      }

      // select active ::
      document.getElementById(id).getElementsByClassName('project-name')[0].classList.add('active');
   }

   onContentLoaded(e, payload) {
      this.setActive(payload.model);

      this.addClickHandler();
   }

   addClickHandler() {
      // click handler on each menu item ::
      for (var i = 0; i < this.items.length; i++) {
         this.clickHandlers.push(this.onChangeProjectClicked.bind(this, this.items[i].id));

         this.items[i].addEventListener('click', this.clickHandlers[i]);
      }
   }

   removeClickHandler() {
      // click handler on each menu item ::
      for (var i = 0; i < this.items.length; i++) {
         this.items[i].removeEventListener('click', this.clickHandlers[i]);
      }
   }

   onChangeProjectClicked(id, e) {
      this.removeClickHandler();

      this.hideMenu();

      // add active to selected ::
      this.setActive(id);

      // let everyone know an item has been clicked ::
      PubSub.publish(ITEM_CLICKED, id);
   }

   onProjectsButtonClicked() {
      // show hide menu ::
      this.contentArea.classList.contains('hidden-menu') === true ? this.showMenu() : this.hideMenu();
   }

   onProjectsButtonClicked() {
      // show hide menu ::
      this.contentArea.classList.contains('hidden-menu') === true ? this.showMenu() : this.hideMenu();
   }

   showMenu() {
      this.contentArea.classList.toggle('hidden-menu');
   }

   hideMenu() {
      this.contentArea.classList.toggle('hidden-menu');
   }

   static get ITEM_CLICKED() {
      return ITEM_CLICKED;
   }
}
export default Menu;
