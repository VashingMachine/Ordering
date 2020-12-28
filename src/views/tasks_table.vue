<template>
  <b-table-simple hover small caption-top responsive bordered>
    <caption></caption>
    <b-thead head-variant="light">
      <b-tr>
        <b-th style="width: 50px; text-align: center" v-for="i in max_length">{{i}}</b-th>
      </b-tr>
      <b-tr v-for="row in table_data">
        <template v-for="(task, index) in row">
          <b-td v-if="index === 0 && task.source.value > 0" :colspan="task.source.value">
          </b-td>
          <b-td style="text-align: center; background-color: skyblue;" :colspan="task.value">{{task.name}}</b-td>
          <b-td v-if="(index + 1) < row.length && row[index + 1].source.value > task.source.value + task.value" :colspan="row[index + 1].source.value - task.source.value - task.value">
          </b-td>
        </template>
      </b-tr>
    </b-thead>
    <b-tbody>
    </b-tbody>
  </b-table-simple>
</template>
<script>
import service from "./service"
export default {
  subscriptions() {
    service.table_data.subscribe(value => console.log(value));
    return {
      table_data: service.table_data
    }
  },
  computed: {
    max_length() {
      if(this.table_data.length > 0) {
        console.log(this.table_data[0][this.table_data[0].length - 1].target.aposteriori);
        return this.table_data[0][this.table_data[0].length - 1].target.aposteriori;
      } else {
      }
    }
  }
};
</script>
<style>
td {

}
</style>