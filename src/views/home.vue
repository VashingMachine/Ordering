<template>
  <div>
    <b-container fluid="true">
      <cytoscape></cytoscape>
      <computer></computer>
      <tasks_table></tasks_table>
    </b-container>
  </div>
</template>
<script>
import cytoscape from "./cytoscape";
import computer from "./computer";
import tasks_table from "./tasks_table";
import {BehaviorSubject} from "rxjs";
export default {
  components: {computer, cytoscape, tasks_table},
  created() {
    window.cyLoaded = new BehaviorSubject(null);
  }
};
</script>