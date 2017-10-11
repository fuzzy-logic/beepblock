import React from 'react';
import PropTypes from 'prop-types';

class Knob extends React.Component {
  static propTypes = {
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    onChangeEnd: PropTypes.func,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    log: PropTypes.bool,
    width: PropTypes.number,
    height: PropTypes.number,
    thickness: PropTypes.number,
    lineCap: PropTypes.oneOf(['butt', 'round']),
    bgColor: PropTypes.string,
    fgColor: PropTypes.string,
    inputColor: PropTypes.string,
    font: PropTypes.string,
    fontWeight: PropTypes.string,
    clockwise: PropTypes.bool,
    cursor: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.bool,
    ]),
    stopper: PropTypes.bool,
    readOnly: PropTypes.bool,
    disableTextInput: PropTypes.bool,
    displayInput: PropTypes.bool,
    displayCustom: PropTypes.func,
    angleArc: PropTypes.number,
    angleOffset: PropTypes.number,
    borderColor: PropTypes.string,
    borderThickness: PropTypes.number, // px
    knobColor: PropTypes.string,
    disableMouseWheel: PropTypes.bool,
    title: PropTypes.string,
  };

  static defaultProps = {
    min: 0,
    max: 100,
    step: 1,
    log: false,
    width: 37, // actual default: width = height = 200px
    height: 37, // see `dimension` below
    thickness: 0.2,
    lineCap: 'butt',
    bgColor: '#595856',
    fgColor: '#FF8400',
    inputColor: '',
    font: 'Arial',
    fontWeight: 'bold',
    clockwise: true,
    cursor: false,
    stopper: true,
    readOnly: false,
    disableTextInput: false,
    displayInput: false,
    angleArc: 300,
    angleOffset: -150,
    borderColor: '#000000',
    borderThickness: 1.25,
    knobColor: '#252828',
    disableMouseWheel: false,
  };

  constructor(props) {
    super(props);
    this.w = this.props.width || 200;
    this.h = this.props.height || this.w;
    this.cursorExt = this.props.cursor === true ? 0.3 : this.props.cursor / 100;
    this.angleArc = this.props.angleArc * Math.PI / 180;
    this.angleOffset = this.props.angleOffset * Math.PI / 180;
    this.startAngle = (1.5 * Math.PI) + this.angleOffset;
    this.endAngle = (1.5 * Math.PI) + this.angleOffset + this.angleArc;
    this.digits = Math.max(
      String(Math.abs(this.props.min)).length,
      String(Math.abs(this.props.max)).length,
      2
    ) + 2;
  }

  componentDidMount() {
    this.drawCanvas();
    if (!this.props.readOnly) {
      this.canvasRef.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    }
  }

  componentDidUpdate() {
    this.drawCanvas();
  }

  componentWillUnmount() {
    this.canvasRef.removeEventListener('touchstart', this.handleTouchStart);
  }

  getArcToValue = (v) => {
    let startAngle;
    let endAngle;
    const angle = !this.props.log
    ? ((v - this.props.min) * this.angleArc) / (this.props.max - this.props.min)
    : Math.log(Math.pow((v / this.props.min), this.angleArc)) / Math.log(this.props.max / this.props.min);
    if (!this.props.clockwise) {
      startAngle = this.endAngle + 0.00001;
      endAngle = startAngle - angle - 0.00001;
    } else {
      startAngle = this.startAngle - 0.00001;
      endAngle = startAngle + angle + 0.00001;
    }
    if (this.props.cursor) {
      startAngle = endAngle - this.cursorExt;
      endAngle += this.cursorExt;
    }
    return {
      startAngle,
      endAngle,
      acw: !this.props.clockwise && !this.props.cursor,
    };
  };

  coerceToStep = (v) => {
    let val = !this.props.log
    ? (~~(((v < 0) ? -0.5 : 0.5) + (v / this.props.step))) * this.props.step
    : Math.pow(this.props.step, ~~(((Math.abs(v) < 1) ? -0.5 : 0.5) + (Math.log(v) / Math.log(this.props.step))));
    val = Math.max(Math.min(val, this.props.max), this.props.min);
    if (isNaN(val)) { val = 0; }
    return Math.round(val * 1000) / 1000;
  };

  eventToValue = (e) => {
    const bounds = this.canvasRef.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    let a = Math.atan2(x - (this.w / 2), (this.w / 2) - y) - this.angleOffset;
    if (!this.props.clockwise) {
      a = this.angleArc - a - (2 * Math.PI);
    }
    if (this.angleArc !== Math.PI * 2 && (a < 0) && (a > -0.5)) {
      a = 0;
    } else if (a < 0) {
      a += Math.PI * 2;
    }
    const val = !this.props.log
    ? (a * (this.props.max - this.props.min) / this.angleArc) + this.props.min
    : Math.pow(this.props.max / this.props.min, a / this.angleArc) * this.props.min;
    return this.coerceToStep(val);
  };

  handleMouseDown = (e) => {
    this.props.onChange(this.eventToValue(e));
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('keyup', this.handleEsc);
  };

  handleMouseMove = (e) => {
    e.preventDefault();
    this.props.onChange(this.eventToValue(e));
  };

  handleMouseUp = (e) => {
    this.props.onChange(this.eventToValue(e));
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('keyup', this.handleEsc);
  };

  handleTouchStart = (e) => {
    e.preventDefault();
    this.touchIndex = e.targetTouches.length - 1;
    this.props.onChange(this.eventToValue(e.targetTouches[this.touchIndex]));
    document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd);
    document.addEventListener('touchcancel', this.handleTouchEnd);
  };

  handleTouchMove = (e) => {
    e.preventDefault();
    this.props.onChange(this.eventToValue(e.targetTouches[this.touchIndex]));
  };

  handleTouchEnd = (e) => {
    this.props.onChange(this.eventToValue(e.changedTouches[this.touchIndex]));
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);
    document.removeEventListener('touchcancel', this.handleTouchEnd);
  };

  handleEsc = (e) => {
    if (e.keyCode === 27) {
      e.preventDefault();
      this.handleMouseUp();
    }
  };

  handleTextInput = (e) => {
    const val = Math.max(Math.min(+e.target.value, this.props.max), this.props.min) || this.props.min;
    this.props.onChange(val);
  };

  handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaX > 0 || e.deltaY > 0) {
      this.props.onChange(this.coerceToStep(
        !this.props.log
        ? this.props.value + this.props.step
        : this.props.value * this.props.step
      ));
    } else if (e.deltaX < 0 || e.deltaY < 0) {
      this.props.onChange(this.coerceToStep(
        !this.props.log
        ? this.props.value - this.props.step
        : this.props.value / this.props.step
      ));
    }
  };

  handleArrowKey = (e) => {
    if (e.keyCode === 37 || e.keyCode === 40) {
      e.preventDefault();
      this.props.onChange(this.coerceToStep(
        !this.props.log
        ? this.props.value - this.props.step
        : this.props.value / this.props.step
      ));
    } else if (e.keyCode === 38 || e.keyCode === 39) {
      e.preventDefault();
      this.props.onChange(this.coerceToStep(
        !this.props.log
        ? this.props.value + this.props.step
        : this.props.value * this.props.step
      ));
    }
  };

  inputStyle = () => ({
    width: `${((this.w / 2) + 4) >> 0}px`,
    height: `${(this.w / 3) >> 0}px`,
    position: 'absolute',
    verticalAlign: 'middle',
    marginTop: `${(this.w / 3) >> 0}px`,
    marginLeft: `-${((this.w * 3 / 4) + 2) >> 0}px`,
    border: 0,
    background: 'none',
    font: `${this.props.fontWeight} ${(this.w / this.digits) >> 0}px ${this.props.font}`,
    textAlign: 'center',
    color: this.props.inputColor || this.props.fgColor,
    padding: '0px',
    WebkitAppearance: 'none',
  });

  drawCanvas() {
    this.canvasRef.width = this.w + (2 * this.props.borderThickness) + 2; // clears the canvas
    this.canvasRef.height = this.h + (2 * this.props.borderThickness);
    const ctx = this.canvasRef.getContext('2d');
    this.xy = (this.w + (2 * this.props.borderThickness)) / 2; // coordinates of canvas center
    this.lineWidth = this.xy * this.props.thickness;
    this.radius = this.xy - (this.lineWidth / 2);
    ctx.lineWidth = this.lineWidth;
    ctx.lineCap = this.props.lineCap;

    // background arc border
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.arc(
      this.xy + 1,
      this.xy + 1,
      this.radius,
      this.endAngle + 0.015,
      this.startAngle - 0.015,
      true
    );
    ctx.stroke();

    // background arc
    ctx.beginPath();
    ctx.strokeStyle = this.props.bgColor;
    ctx.arc(
      this.xy + 1,
      this.xy + 1,
      this.radius,
      this.endAngle - 0.00001,
      this.startAngle + 0.00001,
      true
    );
    ctx.stroke();

    // foreground arc
    const a = this.getArcToValue(this.props.value);
    ctx.beginPath();
    ctx.strokeStyle = this.props.fgColor;
    ctx.arc(
      this.xy + 1,
      this.xy + 1,
      this.radius,
      a.startAngle,
      a.endAngle,
      a.acw
    );
    ctx.stroke();

    // border
    ctx.lineWidth = this.props.borderThickness;
    ctx.strokeStyle = this.props.borderColor;
    ctx.beginPath();
    ctx.arc(this.xy + 1, this.xy + 1, this.radius + (this.xy * this.props.thickness / 2), this.startAngle - 0.00001, this.endAngle + 0.00001);
    ctx.stroke();

    // knob
    ctx.beginPath();
    ctx.arc(this.xy + 1, this.xy + 1, this.radius - (this.xy * this.props.thickness / 2), 0, 2 * Math.PI, false);
    ctx.fillStyle = '#545656';
    ctx.fill();
    ctx.lineWidth = this.borderThickness;
    ctx.strokeStyle = 'black';
    ctx.stroke();
    // Inner Knob
    ctx.beginPath();
    ctx.arc(this.xy + 1, this.xy + 2, this.radius - (this.xy * this.props.thickness / 2) - 2, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#252828';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#252828';
    ctx.stroke();
    // knob indicator border
    ctx.beginPath();
    ctx.lineWidth = this.radius - (1.25 * this.xy * this.props.thickness);
    ctx.strokeStyle = 'black';
    ctx.arc(
      this.xy + 1,
      this.xy + 1,
      (this.radius / 2),
      a.endAngle - 0.2,
      a.endAngle + 0.2,
      a.acw
    );
    ctx.stroke();
    // knob indicator
    ctx.beginPath();
    ctx.lineWidth = this.radius - (1.5 * this.xy * this.props.thickness);
    ctx.strokeStyle = '#D7D7D7';
    ctx.arc(
      this.xy + 1,
      this.xy + 1,
      (this.radius / 2),
      a.endAngle - 0.1,
      a.endAngle + 0.1,
      a.acw
    );
    ctx.stroke();
  }

  renderCentre = () => {
    if (this.props.displayInput) {
      return (
        <input
          style={this.inputStyle()}
          type="text"
          value={this.props.value}
          onChange={this.handleTextInput}
          onKeyDown={this.handleArrowKey}
          readOnly={this.props.readOnly || this.props.disableTextInput}
        />
      );
    } else if (this.props.displayCustom && typeof this.props.displayCustom === 'function') {
      return this.props.displayCustom();
    }
    return null;
  };

  render = () => (
    <div
      style={{ width: this.w, height: this.h, display: 'inline-block' }}
      onWheel={this.props.readOnly || this.props.disableMouseWheel ? null : this.handleWheel}
    >
      <canvas
        ref={(ref) => { this.canvasRef = ref; }}
        style={{ width: '100%', height: '100%' }}
        onMouseDown={this.props.readOnly ? null : this.handleMouseDown}
        title={this.props.title ? `${this.props.title}: ${this.props.value}` : this.props.value}
      />
      {this.renderCentre()}
    </div>
  );
}

class BiDirectionalKnob extends Knob {
  static defaultProps = {
    min: 0,
    max: 127,
    step: 1,
    log: false,
    width: 37, // actual default: width = height = 200px
    height: 37, // see `dimension` below
    thickness: 0.2,
    lineCap: 'butt',
    bgColor: '#595856',
    fgColor: '#52F7FE',
    inputColor: '',
    font: 'Arial',
    fontWeight: 'bold',
    clockwise: true,
    cursor: false,
    stopper: true,
    readOnly: false,
    disableTextInput: false,
    displayInput: false,
    angleArc: 300,
    angleOffset: -150,
    borderColor: '#000000',
    borderThickness: 1.25,
    knobColor: '#252828',
  };

  drawCanvas() {
    this.canvasRef.width = this.w + (2 * this.props.borderThickness) + 2; // clears the canvas
    this.canvasRef.height = this.h + (2 * this.props.borderThickness);
    const ctx = this.canvasRef.getContext('2d');
    this.xy = (this.w + (2 * this.props.borderThickness)) / 2; // coordinates of canvas center
    this.lineWidth = this.xy * this.props.thickness;
    this.radius = this.xy - (this.lineWidth / 2);
    ctx.lineWidth = this.lineWidth;
    ctx.lineCap = this.props.lineCap;

    // background arc border
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.arc(
      this.xy + 1,
      this.xy + 1,
      this.radius,
      this.endAngle + 0.015,
      this.startAngle - 0.015,
      true
    );
    ctx.stroke();

    // background arc
    ctx.beginPath();
    ctx.strokeStyle = this.props.bgColor;
    ctx.arc(
      this.xy + 1,
      this.xy + 1,
      this.radius,
      this.endAngle - 0.00001,
      this.startAngle + 0.00001,
      true
    );
    ctx.stroke();

    // foreground arc
    const a = this.getArcToValue(this.props.value);
    ctx.beginPath();
    ctx.strokeStyle = this.props.fgColor;
    if (this.props.value > 63) {
      a.cw = false;
    } else {
      a.cw = true;
    }
    ctx.arc(
      this.xy + 1,
      this.xy + 1,
      this.radius,
      a.startAngle + 2.61799,
      a.endAngle,
      a.cw
    );
    ctx.stroke();

    // border
    ctx.lineWidth = this.props.borderThickness;
    ctx.strokeStyle = this.props.borderColor;
    ctx.beginPath();
    ctx.arc(this.xy + 1, this.xy + 1, this.radius + (this.xy * this.props.thickness / 2), this.startAngle - 0.00001, this.endAngle + 0.00001);
    ctx.stroke();

    // knob
    ctx.beginPath();
    ctx.arc(this.xy + 1, this.xy + 1, this.radius - (this.xy * this.props.thickness / 2), 0, 2 * Math.PI, false);
    ctx.fillStyle = '#545656';
    ctx.fill();
    ctx.lineWidth = this.borderThickness;
    ctx.strokeStyle = 'black';
    ctx.stroke();
    // Inner Knob
    ctx.beginPath();
    ctx.arc(this.xy + 1, this.xy + 2, this.radius - (this.xy * this.props.thickness / 2) - 2, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#252828';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#252828';
    ctx.stroke();
    // knob indicator border
    ctx.beginPath();
    ctx.lineWidth = this.radius - (1.25 * this.xy * this.props.thickness);
    ctx.strokeStyle = 'black';
    ctx.arc(
      this.xy + 1,
      this.xy + 1,
      (this.radius / 2),
      a.endAngle - 0.2,
      a.endAngle + 0.2,
      a.acw
    );
    ctx.stroke();
    // knob indicator
    ctx.beginPath();
    ctx.lineWidth = this.radius - (1.5 * this.xy * this.props.thickness);
    ctx.strokeStyle = '#D7D7D7';
    ctx.arc(
      this.xy + 1,
      this.xy + 1,
      (this.radius / 2),
      a.endAngle - 0.1,
      a.endAngle + 0.1,
      a.acw
    );
    ctx.stroke();
  }
}

export { Knob, BiDirectionalKnob };
