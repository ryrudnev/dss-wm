import React, { PropTypes, Component } from 'react';
import backboneReact from 'backbone-react-component';
import Griddle from 'griddle-react';

export default class GridContainer extends Component {
  static propTypes = {
    collection: PropTypes.object.isRequired,
    columnMetadata: PropTypes.array,
    columns: PropTypes.array,
  }

  componentWillMount() {
    backboneReact.on(this, {
      collections: { collection: this.props.collection },
    });
  }

  componentWillUnmount() {
    backboneReact.off(this);
  }

  render() {
    return (<div>
      <Griddle
        results={this.state.collection}
        columnMetadata={this.props.columnMetadata}
        columns={this.props.columns}
        noDataMessage="Нет записей"
        previousText="Предыдущая"
        nextText="Следующая"
        maxRowsText="Записей на странице"
        filterPlaceholderText="Фильтр поиска"
        settingsText="Настройки"
        showSettings
        showFilter
        useFixedHeader
        {...this.props}
      />
    </div>);
  }
}
