import { Controller } from 'stimulus'

/*

  <table id="articles-datatable" class="table"
    data-controller="datatable"
    data-datatable-config="<%= {
      debug: true,
      serverSide: true,
      ajax: datatable_articles_path,
      dom: 'lfriptrip',
      columns: [
        {title: 'Title', data: 'title', width: "30%" },
        {title: 'Text', data: 'text', },
      ],
    }.to_json %>"
  >
  </table>

*/

var dt_id = 0

class StimulusDataTables extends Controller {
  isTable = () => this.element.nodeName === 'TABLE'

  isDataTable = () => this.element.className.includes('dataTable')

  isPreview = () =>
    document.documentElement.hasAttribute('data-turbolinks-preview')

  isLive = () => this.dataTable

  isBooting = () =>
    this.isTable() && !this.isDataTable() && !this.isPreview() && !this.isLive()

  debug = (msg, extra = '') => {
    if (!this.config || !this.config.debug) return
    this.log(msg, extra)
  }

  log = (msg, extra = '') => {
    const id = this.element.id
    const pad = msg.length < 10 ? 10 - msg.length : 0
    console.log('DT', this.dt_id || 0, msg, ' '.repeat(pad), id, extra)
  }

  initialize() {
    if (!this.isBooting()) return false

    this.dt_id = ++dt_id
    this.element.dt = this

    // Setting scrollY fixes page reload bug in autoWidth.
    const pre_config = Object.assign({ scrollY: undefined }, this.config)
    const config_s = this.data.get('config')
    const config = config_s ? JSON.parse(config_s) : {}
    this.config = Object.assign({}, pre_config, config)

    this.debug('initialize', { config: this.config })
    return this.config
  }

  connect() {
    if (!this.isBooting()) return false

    // Register the teardown listener and start up DataTable.
    document.addEventListener('turbolinks:before-render', this._teardown)
    this.dataTable = window
      .jQuery(this.element)
      .DataTable(Object.assign({}, this.config))

    this.debug('connect', { dt: this })
    return this.config
  }

  _teardown = () => this.teardown()

  teardown(event) {
    if (!this.isLive()) return false

    document.removeEventListener('turbolinks:before-render', this._teardown)
    this.dataTable.destroy()
    this.dataTable = undefined

    this.debug('teardown')
    return this.config
  }
}

export default StimulusDataTables
