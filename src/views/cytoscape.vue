<template>
  <div style="width: 60%; float: left;">
    <b-col style="height: 100vh; width: 100%;" class="cs">
    </b-col>
    <b-modal
        id="modal-prevent-closing"
        ref="modal"
        title="Submit Your Name"
        @close="denyEdge()"
        @hidden="denyEdge()"
        @cancel="denyEdge()"
        @ok="acceptEdge()"
    >
      <form ref="form" @submit="acceptEdge">
        <b-form-group
            label="Zadanie"
            label-for="z-input">
          <b-form-input
              id="name-input"
              v-model="edge_label"
              required
          ></b-form-input>
        </b-form-group>
        <b-form-group
            label="Czas trwania zadania">
          <b-form-input
              id="t-input"
              v-model="edge_value"
              required
          ></b-form-input>
        </b-form-group>
      </form>
    </b-modal>
  </div>
</template>
<script>
import Cytoscape from "cytoscape";


export default {
  data() {
    return {
      index: '',
      edge_value: "",
      edge_label: ""
    }
  },
  methods: {
    indexInc() {
        let inc = str => {
          if(!str) {
            return 'A';
          } else if(str.endsWith('Z')) {
            return inc(str.slice(0, -1)) + 'A';
          } else {
            return str.slice(0, -1) + String.fromCharCode(str.charCodeAt(str.length - 1) + 1);
          }
        }
        this.index = inc(this.index);
    },
    acceptEdge(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
        this.$refs.modal.hide();
      }
      this.$unlabeled_edge.data.label = `${this.edge_label}: ${this.edge_value}`;
      this.$unlabeled_edge.data.id = this.edge_label;
      window.cy.add(this.$unlabeled_edge);
      this.saveToLocalStorage();
    },
    denyEdge(e) {
      console.log("Deny");
      delete this.$start;
      delete this.$end;
    },
    saveToLocalStorage() {
      const values = window.cy.filter().map(el => ({
        position: el.position(),
        id: el.id(),
        label: el.data('label'),
        group: el.group(),
        data: {
          weight: el.data('weight'),
          id: el.id(),
          source: el.data('source'),
          target: el.data('target'),
          label: el.data('label')
        }
      }));
      localStorage.structure = JSON.stringify(values);
    },
    loadStructure() {
      if(localStorage.structure) {
        const elements = JSON.parse(localStorage.structure);
        cy.add(elements);
      }
    }
  },
  mounted() {
    let v = window.cy = Cytoscape({
      container: this.$el.getElementsByClassName('cs')[0],
      style: [ // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            'background-color': '#667',
            'label': 'data(id)',
            'text-halign': "center",
            'text-valign': "center"
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)'
          }
        }
      ],
      layout: {
        name: 'grid',
        rows: 1
      },
      elements: [
        {
          id: 'Z',
          data: {
            id: 'Z'
          }
        },
        {
          id: 'U',
          data: {
            id: 'U'
          }
        }
      ],
      wheelSensitivity: 0.1,
    });
    let instance = v.contextMenus({

      evtType: 'cxttap',
      // List of initial menu items
      // A menu item must have either onClickFunction or submenu or both
      menuItems: [
        {
          id: 'remove', // ID of menu item
          content: 'remove', // Display content of menu item
          tooltipText: 'remove', // Tooltip text for menu item
          // image: {src : "remove.svg", width : 12, height : 12, x : 6, y : 4}, // menu icon
          // Filters the elements to have this menu item on cxttap
          // If the selector is not truthy no elements will have this menu item on cxttap
          selector: 'node, edge',
          onClickFunction: function () { // The function to be executed on click
          },
          disabled: false, // Whether the item will be created as disabled
          show: false, // Whether the item will be shown or not
          hasTrailingDivider: true, // Whether the item will have a trailing divider
          coreAsWell: false, // Whether core instance have this item on cxttap
          submenu: [] // Shows the listed menuItems as a submenu for this item. An item must have either submenu or onClickFunction or both.
        },
        {
          id: 'hide',
          content: 'Remove',
          tooltipText: 'Remove',
          selector: 'node, edge',
          onClickFunction: (e)=> {
            console.log(e.target);
            if(e.target.id() !== 'Z' && e.target.id() !== 'U'){
              v.remove(e.target);
              this.saveToLocalStorage();
            }
          },
        },
        {
          id: 'add-node',
          content: 'Add node',
          tooltipText: 'Add node',
          selector: 'node',
          coreAsWell: true,
          onClickFunction: (e) => {
            v.add([
              {
                id: this.index,
                group: 'nodes',
                data: {weight: 75, id: this.index},
                position: e.position
              }
            ])
            this.index = this.index.substring(0, this.index.length - 1)
                + String.fromCharCode(this.index.charCodeAt(this.index.length - 1) + 1);
            this.saveToLocalStorage();
          }
        },
      ],
      // css classes that menu items will have
      menuItemClasses: [
        // add class names to this list
      ],
      // css classes that context menu will have
      contextMenuClasses: [
        // add class names to this list
      ],
      // Indicates that the menu item has a submenu. If not provided default one will be used
      // submenuIndicator: { src: 'assets/submenu-indicator-default.svg', width: 12, height: 12 }
    });
    v.on('cxttapstart', 'node', (e) => {
      console.log('cxttapstart');
      this.$start = e.target;
    });
    v.on('cxttapend', 'node', (e) => {
      console.log('cxttapend');
      e.stopPropagation();

      if(this.$start === this.$end || !this.$end || !this.$start) {
        delete this.$start;
        delete this.$end;
      }

      if (this.$end && v.hasElementWithId(this.$end.id())) {

        this.$refs.modal.show();
        this.$unlabeled_edge = {
          data: {id: Math.random() + '', source: this.$start.id(), target: this.$end.id()}
        };
      }
    });
    v.on('cxtdragover', 'node', (e) => {
      console.log('cxtdragover');
      this.$end = e.target
    });
    this.loadStructure();
    this.index = v.filter('node').map(el => el.id()).sort((a, b) => a.length === b.length ? a.localeCompare(b) : a.length - b.length).slice(-1)[0] || '';
    this.indexInc();
    window.cyLoaded.next(true);
  }
};
</script>