/**
 * Represents a single boat in the event
 */
class Boat {
    /**
     * Takes id of the tracker, boat name, sticker number and cc_boats[id] object
     * If object is undefined, data is omitted and only Definition is used
     * @param {number} id - boat id
     * @param {string} name - boat name
     * @param {number} sticker_number - number on tracker
     * @param {Object} object - seesea data object
     */
    constructor(id, name, sticker_number, object) {
        /**
         * Represents SeeSea boat ID
         * @type {number}
         */
        this.id = id;
        /**
         * Represents SeeSea boat name
         * @type {string}
         */
        this.name = name;
        /**
         * Represents number on the tracker
         * @type {number}
         */
        this.sticker_number = sticker_number
        // Checks if data is available
        if (object) {
            /**
             * Represents time since last update in both humanized string and timestamp in seconds
             * @type {{sec: number,human: string}}
             */
            this.last_update = {
                sec: this.last_alive(Date.now(), object['time']),
            }
            this.last_update.human = this.secondsToDhms(this.last_update.sec)

            /**
             * Represents GPS in string format
             * @type (string)
             */
            this.gps = object['signal_gps'];

            /**
             * Represents GSM signal strength in percentage value and icon
             * @type {{value: (number), icon: (string)}}
             */
            this.gsm = {
                value: object['signal_gsm']
            }
            this.gsm.icon = this.gsm_icon()

            /**
             * Represents batteries both in the tracker and on the ship
             * @type {{tracker: {charging: boolean, icon: string, value: (number)}, boat: {icon: string, value: (float)}}}
             */
            this.battery = {
                tracker: {
                    value: object['lionp'],
                    charging: object['chg'] === 'C',
                    icon: ``
                },
                boat: {
                    value: object['battery_boat'],
                    icon: ``
                }
            }
            this.battery.tracker.icon = this.battery_icon('tracker')
            this.battery.boat.icon = this.battery_icon('boat')

            /**
             * Represents the source for boat data
             * @type {*}
             */
            this.source = object['bdata'] //TODO switch to real data after implementation

            /**
             * Represents wind data on the ship
             * @type {{aws: (*|string), aws_dec: string}}
             */
            this.wind = {
                aws: object['aws'] ?? '-',
                aws_dec: ``
            }
            if (object['aws']) {
                this.wind.aws_dec = object['aws'].toFixed(1)
            } else {
                this.wind.aws_dec = '-'
            }

            /**
             * Represents a status of the tracker in
             * @type {{dot: (string), value: (boolean)}} status
             */
            this.status = {
                value: object['available'],
                dot: object['available'] ? '<i class="status-green dot"></i>' : '<i class="status-red dot"></i>'
            };

            /**
             * Changes status dot if boat data is below thresholds
             * @type {string}
             */
            this.status.dot = this.get_status_dot()

            this.data_availible = true
        } else {
            this.data_availible = false
        }
    }

    /**
     *Converts seconds timestamp to humanized string
     * @param {int} seconds - timestamp represented in seconds
     * @returns {string} - string in xdxhxmxs format
     */
    secondsToDhms(seconds) {
        seconds = Number(seconds);
        let d = Math.floor(seconds / (3600 * 24));
        let h = Math.floor(seconds % (3600 * 24) / 3600);
        let m = Math.floor(seconds % 3600 / 60);
        let s = Math.floor(seconds % 60);

        let dDisplay = d > 0 ? d + (d === 1 ? "d" : "d") : "";
        let hDisplay = h > 0 ? h + (h === 1 ? "h" : "h") : "";
        let mDisplay = m > 0 ? m + (m === 1 ? "m" : "m") : "";
        let sDisplay = s > 0 ? s + (s === 1 ? "s" : "s") : "";
        return dDisplay + hDisplay + mDisplay + sDisplay;
    }

    /**
     * Returns status dot based on status and threshold levels
     * @returns {string} - DOM element in string format
     */
    get_status_dot() {
        if (!this.status.value) return `<i class="status-red dot"></i>`
        if (this.gsm.value < 20) return `<i class="status-orange dot"></i>`;
        if (this.battery.tracker.value < 25) return `<i class="status-orange dot"></i>`;
        if (this.battery.boat.value < 8) return `<i class="status-orange dot"></i>`;
        return `<i class="status-green dot"></i>`
    }

    /**
     * Calculates difference between timestamp1 and timestamp2
     * @param timestamp1 - timestamp in seconds
     * @param timestamp2 - timestamp in seconds
     * @returns {number} - difference in seconds
     */
    last_alive(timestamp1, timestamp2) {
        timestamp1 = Math.floor(timestamp1 / 1000)
        let difference = timestamp1 - timestamp2;
        return Math.floor(difference);
    }

    /**
     * Converts battery Voltage to percent
     * @param number {number} - Voltage
     * @param inMin {number} - Minimal input value
     * @param inMax {number} - Maximal input value
     * @param outMin {number} - Minimal output value
     * @param outMax {number} - Maximal output value
     * @returns {number}
     */
    battery_boat_percent(number, inMin, inMax, outMin, outMax) {
        return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    /**
     * Generates GSM icon
     * @returns {string} - DOM element
     */
    gsm_icon() {
        if (this.gsm.value <= 20) return `<div class="signal-bars mt1 sizing-box bad one-bar"><div class="first-bar bar"></div><div class="second-bar bar"></div><div class="third-bar bar"></div><div class="fourth-bar bar"></div><div class="fifth-bar bar"></div></div>`
        if (this.gsm.value <= 40) return `<div class="signal-bars mt1 sizing-box ok two-bars"><div class="first-bar bar"></div><div class="second-bar bar"></div><div class="third-bar bar"></div><div class="fourth-bar bar"></div><div class="fifth-bar bar"></div></div>`
        if (this.gsm.value <= 60) return `<div class="signal-bars mt1 sizing-box good three-bars"><div class="first-bar bar"></div><div class="second-bar bar"></div><div class="third-bar bar"></div><div class="fourth-bar bar"></div><div class="fifth-bar bar"></div></div>`
        if (this.gsm.value <= 80) return `<div class="signal-bars mt1 sizing-box good four-bars"><div class="first-bar bar"></div><div class="second-bar bar"></div><div class="third-bar bar"></div><div class="fourth-bar bar"></div><div class="fifth-bar bar"></div></div>`
        return `<div class="signal-bars mt1 sizing-box good"><div class="first-bar bar"></div><div class="second-bar bar"></div><div class="third-bar bar"></div><div class="fourth-bar bar"></div><div class="fifth-bar bar"></div></div>`
    }

    /**
     * Generates battery icon based on type
     * @param type {string} type='boat'|'tracker'
     * @returns {string} - DOM element
     */
    battery_icon(type) {
        let charge = ``
        if (this.battery.tracker.charging) charge = `charging`
        if (type === 'tracker') {
            if (this.battery[type].value <= 15) return `<div class="battery ${charge}"><div class="battery-level alert" style="height:${this.battery[type].value}%;"></div></div>`
            if (this.battery[type].value <= 40) return `<div class="battery ${charge}"><div class="battery-level warn" style="height:${this.battery[type].value}%;"></div></div>`
            return `<div class="battery ${charge}"><div class="battery-level" style="height:${this.battery[type].value}%;"></div></div>`
        }
        if (type === 'boat') {
            if (this.battery.boat.value <= 15) {
                let percent = this.battery_boat_percent(this.battery[type].value, 8, 15, 10, 100)
                if (percent > 100) percent = 100;
                if (percent <= 10) return `<div class="boat_battery"><div class="boat_battery-level alert" style="height:${percent}%;"></div></div>`
                if (percent <= 25) return `<div class="boat_battery"><div class="boat_battery-level warn" style="height:${percent}%;"></div></div>`
                return `<div class="boat_battery"><div class="boat_battery-level" style="height:${percent}%;"></div></div>`
            }
            return `<div class="boat_battery"><div class="boat_battery-level" style="height:100%; background: #00a0ff"></div></div>`
        }
    }

    /**
     * Generates table rows for Boat object
     * @returns {string} - DOM element
     */
    to_table() {
        if (this.data_availible) {
            return `<tr class="top">
                        <td class="id" colspan="2">
                            ${this.status.dot} ${this.sticker_number}
                        </td>
                        <td colspan="5" class="name">
                            ${this.name}
                        </td>         
                        <td colspan="3">
                            ${this.last_update.human}
                        </td>              
                    </tr>
                    <tr class="bottom">
                        <td class="gps"></td><td>${this.gps ?? '-----'}</td>
                        <td>${this.gsm.icon}</td><td>${this.gsm.value ?? '---'}%</td>
                        <td>${this.battery.tracker.icon}</td><td>${this.battery.tracker.value ?? '---'}%</td>
                        <td>${this.battery.boat.icon}</td><td>${this.battery.boat.value ? this.battery.boat.value.toFixed(1) : (this.battery.boat.value === 0 ? '0' : '---')}V</td>
                        <td>${this.source ?? '---'}</td>
                        <td>${this.wind.aws_dec ?? '--'}kt</td>
                    </tr>
                    <tr class="spacer"></tr>`
        }
        return `<tr class="top single">
                    <td class="id" colspan="2">
                        <i class="status-red dot"></i> ${this.sticker_number}
                    </td>
                    <td colspan="5" class="name">
                        ${this.name}
                    </td>         
                    <td colspan="3">
                        No data
                    </td>              
                </tr>
                <tr class="spacer"></tr>`
    }
}

/**
 * Represents a single Event defined by https://seesea.cz/api/cc_event/['eventId']/?format=json
 */
class Event {
    constructor(responseEvent, responseData) {
        this.id = responseEvent['description']
        this.name = responseEvent['name']
        this.description = responseEvent['description']
        this.cc_boats = responseEvent['cc_object']
        this.responseData = responseData
        this.boats = this.generateBoats()
        this.stats = this.generateStats()
        this.stats.global_status = this.global_status()
    }

    generateBoatTableHTML() {
        let output = ``
        let index
        for (index in this.boats) {
            output = output + this.boats[index].to_table()
        }
        return output
    }

    generateBoats() {
        let output = {}
        let index
        for (index in this.cc_boats) {
            if (this.cc_boats.hasOwnProperty(index)) {
                let stickerNumber = this.cc_boats[index]['start_number']
                let id = this.cc_boats[index]['id']
                let name = this.cc_boats[index]['name']
                let object = this.responseData['objects'][id]
                output[stickerNumber] = new Boat(id, name, stickerNumber, object)
            }
        }
        return output
    }

    generateStats() {
        let index
        let total_boat_count = 0
        let active_boat_count = 0
        let gsm_low = 0
        let battery_low = {
            tracker: 0,
            boat: 0
        }

        for (index in this.boats) {
            let boat = this.boats[index]
            total_boat_count += 1
            if (boat.data_availible) {
                if (boat.status.value) active_boat_count += 1
                if (boat.gsm.value < 20 && boat.gsm.value !== null) gsm_low += 1
                if (boat.battery.tracker.value < 25 && boat.battery.tracker.value !== null) battery_low.tracker += 1
                if (boat.battery.boat.value < 8 && boat.battery.boat.value !== null) battery_low.boat += 1
            }

        }

        return {
            total_boat_count,
            active_boat_count,
            gsm_low,
            battery_low
        }
    }

    global_status() {
        if (this.stats.total_boat_count !== this.stats.active_boat_count) return '<i class="status-orange dot"></i>'
        return '<i class="status-green dot"></i>'
    }

    generateHeaderHTML() {
        return `<div class="div1">${this.description}</div>
        <div class="div2">${this.stats.global_status} ${this.stats.active_boat_count}/${this.stats.total_boat_count}</div>
        <div class="div3"><div class="signal-bars mt1 sizing-box bad one-bar"><div class="first-bar bar"></div><div class="second-bar bar"></div><div class="third-bar bar"></div><div class="fourth-bar bar"></div><div class="fifth-bar bar"></div></div> ${this.stats.gsm_low}</div>
        <div class="div4"><div class="battery"><div class="battery-level alert" style="height:${10}%;"></div></div> ${this.stats.battery_low.tracker}</div>
        <div class="div5"><div class="boat_battery">
  <div class="boat_battery-level alert" style="height: 10%"></div>
</div> ${this.stats.battery_low.boat}</div>`
    }
}