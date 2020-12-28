<template>
  <b-col style="float: right; width: 30%; margin-top: 50px;" id="right-pane">
    <label for="demo-sb">Ścieżki</label>
    <b-form-spinbutton id="demo-sb" v-model="path_index" min="1" :max="longest_paths.length"></b-form-spinbutton>
    <b-table-simple hover small caption-top responsive>
      <caption>Rozpiska zadań</caption>
      <colgroup><col><col></colgroup>
      <colgroup><col><col><col></colgroup>
      <colgroup><col><col></colgroup>
      <b-thead head-variant="dark">
        <b-tr>
          <b-th>Zadanie</b-th>
          <b-th>Najwcześniejszy czas rozpoczęcia</b-th>
          <b-th>Najpóźniejszy optymalny czas rozpoczęcia</b-th>
        </b-tr>
      </b-thead>
      <b-tbody>
        <b-tr v-for="edge of edges">
          <b-td>
            {{edge.name}}
          </b-td>
          <b-td>
            {{edge.source.value}}
          </b-td>
          <b-td>
            {{edge.source.aposteriori}}
          </b-td>
        </b-tr>
      </b-tbody>
    </b-table-simple>
  </b-col>
</template>
<script>
import service from "./service";

export default {
  data() {
    return {
      status: false,
      path_index: 1,
      nodes: [],
      edges: [],
      graph: [],
      longest_paths: [],
      longest_path_edges: [],
      table_data: []
    }
  },
  created() {
    window.cyLoaded.subscribe(status => this.status = status);
  },
  methods: {
    compute_longest_paths() {
      let node = this.nodes.find(node => node.id === 'U');
      let paths = [[]];
      let edges = [[]];
      let traverse = (node, index_path, index_path_edges) => {
        let cool_edges = node.edges.filter(edge => edge.target.id === node.id && edge.source.value === node.value - edge.value);
        let cool_nodes = cool_edges.map(edge => edge.source);
        const save = [...index_path];
        const save_edges = [...index_path_edges];
        for(let i=0; i < cool_nodes.length; i++) {
          if(i===0) {
            index_path.push(cool_nodes[i]);
            index_path_edges.push(cool_edges[i]);
            traverse(cool_nodes[i], index_path, index_path_edges)
          } else {
            const new_path = [...save, cool_nodes[i]];
            const new_path_edges = [...save_edges, cool_edges[i]];
            paths.push(new_path)
            edges.push(new_path_edges)
            traverse(cool_nodes[i], new_path, new_path_edges);
          }
        }
      };
      traverse(node, paths[0], edges[0]);
      this.longest_paths = paths;
      this.longest_path_edges = edges;
    },
    preprocessData() {
      const nodes_cy = window.cy.filter('node');
      const nodes = nodes_cy.map(node_cy => ({
        id: node_cy.id(),
        value: 0,
        edges: node_cy.connectedEdges().map(edge_cy => ({
          value: parseInt(edge_cy.data('label').split(':')[1]),
          name: edge_cy.data('id'),
          source: edge_cy.source().id(),
          target: edge_cy.target().id()
        }))
      }));
      nodes.forEach(node => node.edges.forEach(edge => {
        edge.source = nodes.find(node => node.id === edge.source);
        edge.target = nodes.find(node => node.id === edge.target);
        if (!this.edges.find(e => e.source.id === edge.source.id && e.target.id === edge.target.id)) {
          this.edges.push(edge);
        }
      }));

      let processing_nodes = [...nodes];
      let processed_nodes = [];
      processed_nodes.push(processing_nodes.find(node => node.id === 'Z'));
      processing_nodes = processing_nodes.filter(node => node.id !== 'Z');
      let safetyIndex = 0
      while (processing_nodes.length > 0 && safetyIndex < 1000) {
        processed_nodes.push(...processing_nodes
            .filter(node => processing_nodes.every(n => n.edges.every(edge => edge.target.id !== node.id || processed_nodes.find(pn => pn.id === edge.source.id)))));
        processing_nodes = processing_nodes.filter(node => !processed_nodes.find(n => n.id === node.id));
        safetyIndex++;
      }
      if (safetyIndex >= 1000) {
        console.error("Error with processing graph");
      }
      this.nodes = processed_nodes;
      this.edges.sort((a, b) => parseInt(a.name.slice(1)) - parseInt(b.name.slice(1)));
    },
    cpm() {
      for (let node of this.nodes) {
        node.value = Math.max(...node.edges.filter(edge => edge.target.id === node.id).map(edge => edge.value + edge.source.value), 0);
      }
      this.nodes[this.nodes.length - 1].aposteriori = this.nodes[this.nodes.length - 1].value;
      for (let node of this.nodes.reverse().slice(1)) {
        node.aposteriori = Math.min(...node.edges.filter(edge => edge.source.id === node.id).map(edge => edge.target.aposteriori - edge.value))
      }
    },
    create_table_data() {
      let to_distribute = [...this.edges];
      const rows = [];
      rows.push([...this.longest_path_edges[0]].reverse());
      to_distribute = to_distribute.filter(edge => !this.longest_path_edges[0].find(e => e.name === edge.name));
      while(to_distribute.length > 0) {
        let row = [];
        let task_end_time = 0;
        while(true) {
          let tasks_avaibles = to_distribute.filter(edge => edge.source.value >= task_end_time).sort((a, b) => a.source.value - b.source.value);
          if(tasks_avaibles.length > 0) {
            row.push(tasks_avaibles[0]);
            to_distribute = to_distribute.filter(edge => edge.name !== tasks_avaibles[0].name);
            task_end_time = tasks_avaibles[0].source.value + tasks_avaibles[0].value;
          } else {
            rows.push(row);
            task_end_time = 0;
            break;
          }
        }
      }
      this.table_data = rows;
    },
    bright_longest_paths() {
      window.cy.filter('edge').animate({
        style: {lineColor: "lightgray"}
      });
      for(let edge of this.longest_path_edges[this.path_index - 1]) {
        window.cy.getElementById(edge.name).animate({
          style: {lineColor: "red"}
        });
      }
    }
  },
  watch: {
    status(value) {
      if (value) {
        this.preprocessData();
        this.cpm();
        this.compute_longest_paths();
        this.bright_longest_paths();
        this.create_table_data();
        service.table_data.next(this.table_data);
      }
    },
    path_index(value) {
      this.bright_longest_paths();
    }
  }
};
</script>
<style lang="sass">

</style>