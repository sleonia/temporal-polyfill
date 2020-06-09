import { ES } from './ecmascript.mjs';
import { GetIntrinsic, MakeIntrinsicClass } from './intrinsicclass.mjs';
import { ISO_YEAR, ISO_MONTH, REF_ISO_DAY, CALENDAR, CreateSlots, GetSlot, SetSlot } from './slots.mjs';

const ObjectAssign = Object.assign;

export class YearMonth {
  constructor(isoYear, isoMonth, calendar = undefined, refISODay = 1) {
    isoYear = ES.ToInteger(isoYear);
    isoMonth = ES.ToInteger(isoMonth);
    if (calendar === undefined) calendar = ES.GetDefaultCalendar();
    refISODay = ES.ToInteger(refISODay);
    ES.RejectDate(isoYear, isoMonth, refISODay);
    ES.RejectYearMonthRange(isoYear, isoMonth);
    if (!calendar || typeof calendar !== 'object') throw new RangeError('invalid calendar');
    CreateSlots(this);
    SetSlot(this, ISO_YEAR, isoYear);
    SetSlot(this, ISO_MONTH, isoMonth);
    SetSlot(this, REF_ISO_DAY, refISODay);
    SetSlot(this, CALENDAR, calendar);
  }
  get year() {
    if (!ES.IsTemporalYearMonth(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).year(this);
  }
  get month() {
    if (!ES.IsTemporalYearMonth(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).month(this);
  }
  get calendar() {
    if (!ES.IsTemporalYearMonth(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR);
  }
  get era() {
    if (!ES.IsTemporalYearMonth(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).era(this);
  }
  get daysInMonth() {
    if (!ES.IsTemporalYearMonth(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).daysInMonth(this);
  }
  get daysInYear() {
    if (!ES.IsTemporalYearMonth(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).daysInYear(this);
  }
  get isLeapYear() {
    if (!ES.IsTemporalYearMonth(this)) throw new TypeError('invalid receiver');
    return GetSlot(this, CALENDAR).isLeapYear(this);
  }
  with(temporalYearMonthLike = {}, options) {
    if (!ES.IsTemporalYearMonth(this)) throw new TypeError('invalid receiver');
    if ('calendar' in temporalYearMonthLike) {
      throw new RangeError('invalid calendar property in year-month-like');
    }
    const props = ES.ToPartialRecord(temporalYearMonthLike, ['era', 'month', 'year']);
    if (!props) {
      throw new RangeError('invalid year-month-like');
    }
    const fields = ES.ToRecord(this, [['era', undefined], ['month'], ['year']]);
    ObjectAssign(fields, props);
    const Construct = ES.SpeciesConstructor(this, YearMonth);
    const result = GetSlot(this, CALENDAR).yearMonthFromFields(fields, options, Construct);
    if (!ES.IsTemporalYearMonth(result)) throw new TypeError('invalid result');
    return result;
  }
  plus(temporalDurationLike, options) {
    if (!ES.IsTemporalYearMonth(this)) throw new TypeError('invalid receiver');
    const duration = ES.ToLimitedTemporalDuration(temporalDurationLike);
    const { hours, minutes, seconds, milliseconds, microseconds, nanoseconds } = duration;
    const { days } = ES.BalanceDuration(
      duration.days,
      hours,
      minutes,
      seconds,
      milliseconds,
      microseconds,
      nanoseconds,
      'days'
    );

    const TemporalDate = GetIntrinsic('%Temporal.Date%');
    const calendar = GetSlot(this, CALENDAR);
    const era = calendar.era(this);
    const year = calendar.year(this);
    const month = calendar.month(this);
    const firstOfCalendarMonth = calendar.dateFromFields({ era, year, month, day: 1 }, {}, TemporalDate);
    const addedDate = calendar.plus(firstOfCalendarMonth, { ...duration, days }, options, TemporalDate);

    const Construct = ES.SpeciesConstructor(this, YearMonth);
    const result = calendar.yearMonthFromFields(addedDate, options, Construct);
    if (!ES.IsTemporalYearMonth(result)) throw new TypeError('invalid result');
    return result;
  }
  minus(temporalDurationLike, options) {
    if (!ES.IsTemporalYearMonth(this)) throw new TypeError('invalid receiver');
    const duration = ES.ToLimitedTemporalDuration(temporalDurationLike);
    const { hours, minutes, seconds, milliseconds, microseconds, nanoseconds } = duration;
    const { days } = ES.BalanceDuration(
      duration.days,
      hours,
      minutes,
      seconds,
      milliseconds,
      microseconds,
      nanoseconds,
      'days'
    );

    const TemporalDate = GetIntrinsic('%Temporal.Date%');
    const calendar = GetSlot(this, CALENDAR);
    const era = calendar.era(this);
    const year = calendar.year(this);
    const month = calendar.month(this);
    const lastDay = calendar.daysInMonth(this);
    const lastOfCalendarMonth = calendar.dateFromFields({ era, year, month, day: lastDay }, {}, TemporalDate);
    const subtractedDate = calendar.minus(lastOfCalendarMonth, { ...duration, days }, options, TemporalDate);

    const Construct = ES.SpeciesConstructor(this, YearMonth);
    const result = calendar.yearMonthFromFields(subtractedDate, options, Construct);
    if (!ES.IsTemporalYearMonth(result)) throw new TypeError('invalid result');
    return result;
  }
  difference(other, options) {
    if (!ES.IsTemporalYearMonth(this)) throw new TypeError('invalid receiver');
    if (!ES.IsTemporalYearMonth(other)) throw new TypeError('invalid YearMonth object');
    const calendar = GetSlot(this, CALENDAR);
    if (calendar.id !== GetSlot(other, CALENDAR).id) {
      other = new Date(GetSlot(other, ISO_YEAR), GetSlot(other, ISO_MONTH), calendar, GetSlot(other, REF_ISO_DAY));
    }
    const largestUnit = ES.ToLargestTemporalUnit(options, 'years', ['weeks', 'days', 'hours', 'minutes', 'seconds']);
    const [one, two] = [this, other].sort(YearMonth.compare);

    const smallerFields = ES.ToRecord(one, [['era', undefined], ['month'], ['year']]);
    const largerFields = ES.ToRecord(two, [['era', undefined], ['month'], ['year']]);
    const TemporalDate = GetIntrinsic('%Temporal.Date%');
    const smaller = calendar.dateFromFields({ ...smallerFields, day: 1 }, {}, TemporalDate);
    const larger = calendar.dateFromFields({ ...largerFields, day: 1 }, {}, TemporalDate);
    return calendar.difference(smaller, larger, { ...options, largestUnit });
  }
  equals(other) {
    if (!ES.IsTemporalYearMonth(this)) throw new TypeError('invalid receiver');
    if (!ES.IsTemporalYearMonth(other)) throw new TypeError('invalid YearMonth object');
    for (const slot of [ISO_YEAR, ISO_MONTH, REF_ISO_DAY]) {
      const val1 = GetSlot(this, slot);
      const val2 = GetSlot(other, slot);
      if (val1 !== val2) return false;
    }
    return GetSlot(this, CALENDAR).id === GetSlot(other, CALENDAR).id;
  }
  toString() {
    if (!ES.IsTemporalYearMonth(this)) throw new TypeError('invalid receiver');
    let year = ES.ISOYearString(GetSlot(this, ISO_YEAR));
    let month = ES.ISODateTimePartString(GetSlot(this, ISO_MONTH));
    let resultString = `${year}-${month}`;
    const calendar = ES.FormatCalendarAnnotation(GetSlot(this, CALENDAR));
    if (calendar) {
      const day = ES.ISODateTimePartString(GetSlot(this, REF_ISO_DAY));
      resultString = `${resultString}-${day}${calendar}`;
    }
    return resultString;
  }
  toLocaleString(...args) {
    if (!ES.IsTemporalYearMonth(this)) throw new TypeError('invalid receiver');
    return new Intl.DateTimeFormat(...args).format(this);
  }
  valueOf() {
    throw new TypeError('use compare() or equals() to compare Temporal.YearMonth');
  }
  withDay(day) {
    if (!ES.IsTemporalYearMonth(this)) throw new TypeError('invalid receiver');
    const calendar = GetSlot(this, CALENDAR);
    const era = calendar.era(this);
    const month = calendar.month(this);
    const year = calendar.year(this);
    const Date = GetIntrinsic('%Temporal.Date%');
    return calendar.dateFromFields({ era, year, month, day }, { disambiguation: 'reject' }, Date);
  }
  getFields() {
    const fields = ES.ToRecord(this, [['era', undefined], ['month'], ['year']]);
    if (!fields) throw new TypeError('invalid receiver');
    fields.calendar = GetSlot(this, CALENDAR);
    return fields;
  }
  getISOCalendarFields() {
    if (!ES.IsTemporalYearMonth(this)) throw new TypeError('invalid receiver');
    return {
      year: GetSlot(this, ISO_YEAR),
      month: GetSlot(this, ISO_MONTH),
      day: GetSlot(this, REF_ISO_DAY)
    };
  }
  static from(item, options = undefined) {
    const disambiguation = ES.ToTemporalDisambiguation(options);
    const TemporalCalendar = GetIntrinsic('%Temporal.Calendar%');
    let result;
    if (typeof item === 'object' && item) {
      if (ES.IsTemporalYearMonth(item)) {
        const year = GetSlot(item, ISO_YEAR);
        const month = GetSlot(item, ISO_MONTH);
        const calendar = GetSlot(item, CALENDAR);
        const refISODay = GetSlot(item, REF_ISO_DAY);
        result = new this(year, month, calendar, refISODay);
      } else {
        let calendar = item.calendar;
        if (calendar === undefined) calendar = ES.GetDefaultCalendar();
        calendar = TemporalCalendar.from(calendar);
        result = calendar.yearMonthFromFields(item, options, this);
      }
    } else {
      let { year, month, refISODay, calendar } = ES.ParseTemporalYearMonthString(ES.ToString(item));
      ({ year, month } = ES.RegulateYearMonth(year, month, disambiguation));
      ({ year, month } = ES.RegulateYearMonthRange(year, month, disambiguation));
      if (!calendar) calendar = ES.GetDefaultCalendar();
      calendar = TemporalCalendar.from(calendar);
      if (refISODay === undefined) refISODay = 1;
      result = new this(year, month, calendar, refISODay);
    }
    if (!ES.IsTemporalYearMonth(result)) throw new TypeError('invalid result');
    return result;
  }
  static compare(one, two) {
    if (!ES.IsTemporalYearMonth(one) || !ES.IsTemporalYearMonth(two)) throw new TypeError('invalid YearMonth object');
    for (const slot of [ISO_YEAR, ISO_MONTH, REF_ISO_DAY]) {
      const val1 = GetSlot(one, slot);
      const val2 = GetSlot(two, slot);
      if (val1 !== val2) return ES.ComparisonResult(val1 - val2);
    }
    const cal1 = GetSlot(one, CALENDAR).id;
    const cal2 = GetSlot(two, CALENDAR).id;
    return ES.ComparisonResult(cal1 < cal2 ? -1 : cal1 > cal2 ? 1 : 0);
  }
}
YearMonth.prototype.toJSON = YearMonth.prototype.toString;

MakeIntrinsicClass(YearMonth, 'Temporal.YearMonth');
