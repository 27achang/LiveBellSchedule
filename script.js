var SCHEDULE_TYPES, today, schedule, schedule_times, override_date, override_schedule, override_time, initialization_time, has_preblock, current_periods, update_interval, update_frequency, check_for_new_day_interval;

const blue_green_schedule = {preblock_start: '08:00', preblock_end: '09:15', period1_start: '09:30', period1_end: '10:55', lower_lunch_start: '10:55', lower_lunch_end: '11:40', lower_period2_start: '11:50', lower_period2_end: '13:05', upper_period2_start: '11:05', upper_period2_end: '12:20', upper_lunch_start: '12:20', upper_lunch_end: '13:05', period3_start: '13:15', period3_end: '14:30'};
const gold_schedule = {preblock_start: '08:00', preblock_end: '09:15', period1_start: '09:30', period1_end: '10:40', founders_period_start: '10:40', founders_period_end: '11:20', lower_lunch_start: '11:20', lower_lunch_end: '11:50', lower_period2_start: '12:00', lower_period2_end: '13:10', upper_period2_start: '11:30', upper_period2_end: '12:40', upper_lunch_start: '12:40', upper_lunch_end: '13:10', period3_start: '13:20', period3_end: '14:30'};
const mass_schedule = {period1_start: '09:00', period1_end: '09:55', mass_start: '10:05', mass_end: '11:35', lunch_start: '11:35', lunch_end: '12:20', period2_start: '12:30', period2_end: '13:25', period3_start: '13:25', period3_end: '14:30'};
const founders_am_schedule = {period1_start: '09:30', period1_end: '10:35', founders_period_start: '10:45', founders_period_end: '11:55', lunch_start: '11:55', lunch_end: '12:30', period2_start: '12:40', period2_end: '13:45', period3_start: '13:55', period3_end: '15:00'};
const founders_pm_schedule = {period1_start: '09:30', period1_end: '10:35', lower_lunch_start: '10:35', lower_lunch_end: '11:20', lower_period2_start: '11:30', lower_period2_end: '12:35', upper_period2_start: '10:45', upper_period2_end: '11:50', upper_lunch_start: '11:50', upper_lunch_end: '12:35', period3_start: '12:45', period3_end: '13:50', founders_period_start: '14:00', founders_period_end: '15:00'};
const full_schedule = {period1_start: '09:30', period1_end: '10:10', period2_start: '10:20', period2_end: '11:00', period3_start: '11:10', period3_end: '11:50', lower_lunch_start: '12:00', lower_lunch_end: '12:30', lower_period4_start: '12:40', lower_period4_end: '13:20', upper_period4_start: '12:00', upper_period4_end: '12:40', upper_lunch_start: '12:50', upper_lunch_end: '13:20', period5_start: '13:30', period5_end: '14:10', period6_start: '14:20', period6_end: '15:00'};

// DOM Objects
const header = document.getElementById("header");
const date_display = document.getElementById("date");
const schedule_type_display = document.getElementById("schedule_type");
const schedule_table = document.getElementById("schedule");

// Update the displays in the header, load the table with the appropriate format for the day's schedule type, and set the interval to update the live schedule
function onNewDay() {
    today = new Date();

    // Update the displayed date
    date_display.textContent = new Intl.DateTimeFormat("en-US", {weekday: "long", month: "long", day: "numeric"}).format((override_date ? new Date(override_date) : today));

    // Update the displayed schedule type and set the background color of the main section
    let schedule_type;
    if (override_schedule) schedule_type = override_schedule;
    else schedule_type = SCHEDULE_TYPES[new Intl.DateTimeFormat("en-US").format((override_date ? new Date(override_date) : today))];
    // If there was no schedule type stored for today, reset styling and stop execution
    if (schedule_type === undefined) {
        schedule_type_display.style.display = "none";
        document.body.style.backgroundColor = "white";
        header.style.backgroundColor = "white";
        return;
    }

    schedule = schedule_type.split(": ")[0];
    switch (schedule) {
        case "F-AM":
            schedule_type_display.textContent = "Founders AM " + schedule_type.split(" (")[0].split(" [")[0].split(": ")[1];
            break;
        case "F-PM":
            schedule_type_display.textContent = "Founders PM " + schedule_type.split(" (")[0].split(" [")[0].split(": ")[1];
            break;
        case "Mass":
            schedule_type_display.textContent = schedule_type.split(" (")[0].split(" [")[0].split(": ")[1];
            break;
        default:
            schedule_type_display.textContent = schedule_type.split(" (")[0].split(" [")[0].split(": ").join(" "); // Remove colon for displayed schedule type
    }
    if (schedule_type_display.style.display == "none") schedule_type_display.style.display = "inline-block";

    let blocks = schedule_type.split(": ")[1]; // Includes " (PE/Health)" postfix indicator

    // Set the background color
    header.style.borderBottom = "";
    switch (schedule) {
        case "Blue":
            document.body.style.setProperty("--primary", "var(--blue-text)");
            document.body.style.setProperty("--text", "white");
            document.body.style.setProperty("--background", "var(--blue-background)");
            break;
        case "Green":
            document.body.style.setProperty("--primary", "var(--green-text)");
            document.body.style.setProperty("--text", "white");
            document.body.style.setProperty("--background", "var(--green-background)");
            break;
        case "Gold":
        case "F-AM":
        case "F-PM":
            document.body.style.setProperty("--primary", "var(--gold-text)");
            document.body.style.setProperty("--text", "white");
            document.body.style.setProperty("--background", "var(--gold-background)");
            break;
        case "Mass":
            document.body.style.setProperty("--primary", "var(--light-blue)");
            document.body.style.setProperty("--text", "white"); // Consider black for accessibility/readability
            document.body.style.setProperty("--background", "white");
            break;
        case "Full":
            header.style.borderBottom = "1px solid black";
        default: // Including Full schedules
            document.body.style.setProperty("--primary", "white");
            document.body.style.setProperty("--text", "black");
            document.body.style.setProperty("--background", "white");
    }

    // Create the schedule table
    schedule_table.innerHTML = "";
    switch (schedule) {
        case "Blue":
        case "Green":
            makeBlueGreenScheduleTable(schedule, blocks);
            schedule_times = blue_green_schedule;
            updateBlueGreenSchedule(blocks);
            break;
        case "Gold":
            makeGoldScheduleTable(blocks);
            schedule_times = gold_schedule;
            updateBlueGreenSchedule(blocks);
            break;
        case "F-AM":
            makeFoundersAMScheduleTable(blocks);
            schedule_times = founders_am_schedule;
            break;
        case "F-PM":
            makeFoundersPMScheduleTable(blocks);
            schedule_times = founders_pm_schedule;
            break;
        case "Mass":
            makeMassScheduleTable(blocks);
            schedule_times = mass_schedule;
            break;
        case "Full":
            makeFullScheduleTable(blocks);
            schedule_times = full_schedule;
    }

    if (override_date === undefined) check_for_new_day_interval = setInterval(checkForNewDay, 60 * 60 * 1000);
}

function checkForNewDay() {
    if (new Date().getDate() != today.getDate()) onNewDay();
}

function makeBlueGreenScheduleTable(schedule, blocks_input) {
    let blocks = blocks_input.split(" ")[0].split(",");
    let pe_health = blocks_input.split(" ")[1] == "(PE/Health)";
    has_preblock = blocks.includes("7") || blocks.includes("8");

    if (!has_preblock) {
        let row1 = document.createElement("tr");
        let warning = document.createElement("td");
        warning.textContent = " No block " + (schedule == "Blue" ? "7" : "8");
        warning.colSpan = 4;
        warning.className = "warning";
        row1.appendChild(warning);
        schedule_table.appendChild(row1);
    } else {
        let row1 = document.createElement("tr");
        let time1 = document.createElement("td");
        time1.textContent = "8:00–9:15";
        time1.className = "left_column";
        time1.id = "preblock_time";
        time1.colSpan = 2;
        row1.appendChild(time1);
        let label1 = document.createElement("td");
        label1.textContent = "Block " + blocks[0];
        label1.className = "right_column";
        label1.id = "preblock_label";
        label1.colSpan = 2;
        if (pe_health) {
            label1.textContent += " ";
            let span = document.createElement("span");
            span.textContent = "(PE/Health)";
            span.className = "colored";
            label1.appendChild(span);
        }
        row1.appendChild(label1);
        schedule_table.appendChild(row1);
    }
    
    let row2 = document.createElement("tr");
    let time2 = document.createElement("td");
    time2.textContent = "9:30–10:55";
    time2.className = "left_column";
    time2.id = "period1_time";
    time2.colSpan = 2;
    row2.appendChild(time2);
    let label2 = document.createElement("td");
    label2.textContent = "Block " + blocks[1 - !has_preblock] + " ";
    label2.className = "right_column";
    label2.id = "period1_label";
    label2.colSpan = 2;
    let announcements_span = document.createElement("span");
    announcements_span.textContent = "(Announcements)";
    announcements_span.className = "colored";
    label2.appendChild(announcements_span);
    row2.appendChild(label2);
    schedule_table.appendChild(row2);

    let spacer_row1 = document.createElement("tr");
    spacer_row1.className = "spacer";
    schedule_table.appendChild(spacer_row1);
    
    let row3 = document.createElement("tr");
    let lower_header = document.createElement("td");
    lower_header.textContent = "Frosh/Soph";
    lower_header.className = "lunch_header colored left_column";
    lower_header.colSpan = 2;
    row3.appendChild(lower_header);
    let upper_header = document.createElement("td");
    upper_header.textContent = "Juniors/Seniors";
    upper_header.className = "lunch_header colored right_column";
    upper_header.colSpan = 2;
    row3.appendChild(upper_header);
    schedule_table.appendChild(row3);

    let row4 = document.createElement("tr");
    let lower_time1 = document.createElement("td");
    lower_time1.textContent = "10:55–11:40";
    lower_time1.className = "colored left_column";
    lower_time1.id = "lower_lunch_time";
    row4.appendChild(lower_time1);
    let lower_label1 = document.createElement("td");
    lower_label1.textContent = "Lunch";
    lower_label1.className = "colored left_midcolumn";
    lower_label1.id = "lower_lunch_label";
    row4.appendChild(lower_label1);
    let upper_time1 = document.createElement("td");
    upper_time1.textContent = "11:05–12:20";
    upper_time1.className = "right_midcolumn";
    upper_time1.id = "upper_period2_time";
    row4.appendChild(upper_time1);
    let upper_label1 = document.createElement("td");
    upper_label1.textContent = "Block " + blocks[2 - !has_preblock];
    upper_label1.className = "right_column";
    upper_label1.id = "upper_period2_label";
    row4.appendChild(upper_label1);
    schedule_table.appendChild(row4);

    let row5 = document.createElement("tr");
    let lower_time2 = document.createElement("td");
    lower_time2.textContent = "11:50–1:05";
    lower_time2.className = "left_column";
    lower_time2.id = "lower_period2_time";
    row5.appendChild(lower_time2);
    let lower_label2 = document.createElement("td");
    lower_label2.textContent = "Block " + blocks[2 - !has_preblock];
    lower_label2.className = "left_midcolumn";
    lower_label2.id = "lower_period2_label";
    row5.appendChild(lower_label2);
    let upper_time2 = document.createElement("td");
    upper_time2.textContent = "12:20–1:05";
    upper_time2.className = "colored right_midcolumn";
    upper_time2.id = "upper_lunch_time";
    row5.appendChild(upper_time2);
    let upper_label2 = document.createElement("td");
    upper_label2.textContent = "Lunch";
    upper_label2.className = "colored right_column";
    upper_label2.id = "upper_lunch_label";
    row5.appendChild(upper_label2);
    schedule_table.appendChild(row5);

    let spacer_row2 = document.createElement("tr");
    spacer_row2.className = "spacer";
    schedule_table.appendChild(spacer_row2);
    
    let row6 = document.createElement("tr");
    let time4 = document.createElement("td");
    time4.textContent = "1:15–2:30";
    time4.className = "left_column";
    time4.id = "period3_time";
    time4.colSpan = 2;
    row6.appendChild(time4);
    let label4 = document.createElement("td");
    label4.textContent = "Block " + blocks[3 - !has_preblock] + " ";
    label4.className = "right_column";
    label4.id = "period3_label";
    label4.colSpan = 2;
    row6.appendChild(label4);
    schedule_table.appendChild(row6);
}

function makeGoldScheduleTable(blocks_input) {
    let blocks = blocks_input.split(" ")[0].split(",");
    let pe_health = blocks_input.includes("(") && blocks_input.split(" (")[1].split(")")[0] == "PE/Health";
    has_preblock = blocks.includes("7") || blocks.includes("8");
    // let topic;
    // if (blocks_input.includes("[")) topic = blocks_input.split(" [")[1].split("]")[0];

    if (!has_preblock) {
        let row1 = document.createElement("tr");
        let warning = document.createElement("td");
        warning.textContent = " No block " + (blocks.includes("1") ? "7" : "8");
        warning.colSpan = 4;
        warning.className = "warning";
        row1.appendChild(warning);
        schedule_table.appendChild(row1);
    } else {
        let row1 = document.createElement("tr");
        let time1 = document.createElement("td");
        time1.textContent = "8:00–9:15";
        time1.className = "left_column";
        time1.colSpan = 2;
        row1.appendChild(time1);
        let label1 = document.createElement("td");
        label1.textContent = "Block " + blocks[0];
        label1.className = "right_column";
        label1.colSpan = 2;
        if (pe_health) {
            label1.textContent += " ";
            let span = document.createElement("span");
            span.textContent = "(PE/Health)";
            span.className = "colored";
            label1.appendChild(span);
        }
        row1.appendChild(label1);
        schedule_table.appendChild(row1);
    }
    
    let row2 = document.createElement("tr");
    let time2 = document.createElement("td");
    time2.textContent = "9:30–10:40";
    time2.className = "left_column";
    time2.colSpan = 2;
    row2.appendChild(time2);
    let label2 = document.createElement("td");
    label2.textContent = "Block " + blocks[1 - !has_preblock];
    label2.className = "right_column";
    label2.colSpan = 2;
    row2.appendChild(label2);
    schedule_table.appendChild(row2);
    
    let row3 = document.createElement("tr");
    let time3 = document.createElement("td");
    time3.textContent = "10:40–11:20";
    time3.className = "left_column";
    time3.setAttribute("style", "vertical-align: top;");
    time3.colSpan = 2;
    row3.appendChild(time3);
    let label3 = document.createElement("td");
    label3.appendChild(document.createTextNode("Announcements &"));
    label3.appendChild(document.createElement("br"));
    label3.appendChild(document.createTextNode("Founders Period (F30)"));
    label3.className = "right_column";
    label3.colSpan = 2;
    // if (topic) {
    //     label3.appendChild(document.createElement("br"));
    //     let topic_span = document.createElement("span");
    //     topic_span.textContent = "(" + topic + ")";
    //     topic_span.className = "colored";
    //     label3.appendChild(topic_span);
    // }
    row3.appendChild(label3);
    schedule_table.appendChild(row3);

    let spacer_row1 = document.createElement("tr");
    spacer_row1.className = "spacer";
    schedule_table.appendChild(spacer_row1);
    
    let row4 = document.createElement("tr");
    let lower_header = document.createElement("td");
    lower_header.textContent = "Frosh/Soph";
    lower_header.className = "lunch_header colored left_column";
    lower_header.colSpan = 2;
    row4.appendChild(lower_header);
    let upper_header = document.createElement("td");
    upper_header.textContent = "Juniors/Seniors";
    upper_header.className = "lunch_header colored right_column";
    upper_header.colSpan = 2;
    row4.appendChild(upper_header);
    schedule_table.appendChild(row4);

    let row5 = document.createElement("tr");
    let lower_time1 = document.createElement("td");
    lower_time1.textContent = "11:20–11:50";
    lower_time1.className = "colored left_column";
    row5.appendChild(lower_time1);
    let lower_label1 = document.createElement("td");
    lower_label1.textContent = "Lunch";
    lower_label1.className = "colored left_midcolumn";
    row5.appendChild(lower_label1);
    let upper_time1 = document.createElement("td");
    upper_time1.textContent = "11:30–12:40";
    upper_time1.className = "right_midcolumn";
    row5.appendChild(upper_time1);
    let upper_label1 = document.createElement("td");
    upper_label1.textContent = "Block " + blocks[3 - !has_preblock];
    upper_label1.className = "right_column";
    row5.appendChild(upper_label1);
    schedule_table.appendChild(row5);

    let row6 = document.createElement("tr");
    let lower_time2 = document.createElement("td");
    lower_time2.textContent = "12:00–1:10";
    lower_time2.className = "left_column";
    row6.appendChild(lower_time2);
    let lower_label2 = document.createElement("td");
    lower_label2.textContent = "Block " + blocks[3 - !has_preblock];
    lower_label2.className = "left_midcolumn";
    row6.appendChild(lower_label2);
    let upper_time2 = document.createElement("td");
    upper_time2.textContent = "12:40–1:10";
    upper_time2.className = "colored right_midcolumn";
    row6.appendChild(upper_time2);
    let upper_label2 = document.createElement("td");
    upper_label2.textContent = "Lunch";
    upper_label2.className = "colored right_column";
    row6.appendChild(upper_label2);
    schedule_table.appendChild(row6);

    let spacer_row2 = document.createElement("tr");
    spacer_row2.className = "spacer";
    schedule_table.appendChild(spacer_row2);
    
    let row7 = document.createElement("tr");
    let time4 = document.createElement("td");
    time4.textContent = "1:20–2:30";
    time4.className = "left_column";
    time4.colSpan = 2;
    row7.appendChild(time4);
    let label4 = document.createElement("td");
    label4.textContent = "Block " + blocks[4 - !has_preblock];
    label4.className = "right_column";
    label4.colSpan = 2;
    row7.appendChild(label4);
    schedule_table.appendChild(row7);
}

function makeFoundersAMScheduleTable(blocks_input) {
    let blocks = blocks_input.split(" ")[0].split(",");
    let pe_health = blocks_input.includes("(") && blocks_input.split(" (")[1].split(")")[0] == "PE/Health";
    has_preblock = blocks.includes("7") || blocks.includes("8");

    if (has_preblock) {
        let row = document.createElement("tr");
        let time = document.createElement("td");
        time.textContent = "8:00–9:15";
        time.className = "left_column";
        row.appendChild(time);
        let label = document.createElement("td");
        label.textContent = "Block " + blocks[0];
        label.className = "right_column";
        if (pe_health) {
            label.textContent += " ";
            let span = document.createElement("span");
            span.textContent = "(PE/Health)";
            span.className = "colored";
            label.appendChild(span);
        }
        row.appendChild(label);
        schedule_table.appendChild(row);
    }

    let row1 = document.createElement("tr");
    let time1 = document.createElement("td");
    time1.textContent = "9:30–10:35";
    time1.className = "left_column";
    row1.appendChild(time1);
    let label1 = document.createElement("td");
    label1.textContent = "Block " + blocks[0 + has_preblock];
    label1.className = "right_column";
    row1.appendChild(label1);
    schedule_table.appendChild(row1);
    
    let row2 = document.createElement("tr");
    let time2 = document.createElement("td");
    time2.textContent = "10:45–11:55";
    time2.className = "left_column";
    row2.appendChild(time2);
    let label2 = document.createElement("td");
    label2.textContent = "Founders Period (F70)";
    label2.className = "right_column";
    row2.appendChild(label2);
    schedule_table.appendChild(row2);
    
    let row3 = document.createElement("tr");
    let time3 = document.createElement("td");
    time3.textContent = "11:55–12:30";
    time3.className = "colored left_column";
    row3.appendChild(time3);
    let label3 = document.createElement("td");
    label3.textContent = "All-School Lunch";
    label3.className = "colored right_column";
    row3.appendChild(label3);
    schedule_table.appendChild(row3);
    
    let row4 = document.createElement("tr");
    let time4 = document.createElement("td");
    time4.textContent = "12:40–1:45";
    time4.className = "left_column";
    row4.appendChild(time4);
    let label4 = document.createElement("td");
    label4.textContent = "Block " + blocks[2 + has_preblock];
    label4.className = "right_column";
    row4.appendChild(label4);
    schedule_table.appendChild(row4);
    
    let row5 = document.createElement("tr");
    let time5 = document.createElement("td");
    time5.textContent = "1:55–3:00";
    time5.className = "left_column";
    row5.appendChild(time5);
    let label5 = document.createElement("td");
    label5.textContent = "Block " + blocks[3 + has_preblock];
    label5.className = "right_column";
    row5.appendChild(label5);
    schedule_table.appendChild(row5);
}

function makeFoundersPMScheduleTable(blocks_input) {
    let blocks = blocks_input.split(" ")[0].split(",");
    let pe_health = blocks_input.includes("(") && blocks_input.split(" (")[1].split(")")[0] == "PE/Health";
    has_preblock = blocks.includes("7") || blocks.includes("8");

    if (has_preblock) {
        let row1 = document.createElement("tr");
        let time1 = document.createElement("td");
        time1.textContent = "8:00–9:15";
        time1.className = "left_column";
        time1.colSpan = 2;
        row1.appendChild(time1);
        let label1 = document.createElement("td");
        label1.textContent = "Block " + blocks[0];
        label1.className = "right_column";
        label1.colSpan = 2;
        if (pe_health) {
            label1.textContent += " ";
            let span = document.createElement("span");
            span.textContent = "(PE/Health)";
            span.className = "colored";
            label1.appendChild(span);
        }
        row1.appendChild(label1);
        schedule_table.appendChild(row1);
    }
    
    let row2 = document.createElement("tr");
    let time2 = document.createElement("td");
    time2.textContent = "9:30–10:35";
    time2.className = "left_column";
    time2.colSpan = 2;
    row2.appendChild(time2);
    let label2 = document.createElement("td");
    label2.textContent = "Block " + blocks[0 + has_preblock];
    label2.className = "right_column";
    label2.colSpan = 2;
    row2.appendChild(label2);
    schedule_table.appendChild(row2);

    let spacer_row1 = document.createElement("tr");
    spacer_row1.className = "spacer";
    schedule_table.appendChild(spacer_row1);
    
    let row3 = document.createElement("tr");
    let lower_header = document.createElement("td");
    lower_header.textContent = "Frosh/Soph";
    lower_header.className = "lunch_header colored left_column";
    lower_header.colSpan = 2;
    row3.appendChild(lower_header);
    let upper_header = document.createElement("td");
    upper_header.textContent = "Juniors/Seniors";
    upper_header.className = "lunch_header colored right_column";
    upper_header.colSpan = 2;
    row3.appendChild(upper_header);
    schedule_table.appendChild(row3);

    let row4 = document.createElement("tr");
    let lower_time1 = document.createElement("td");
    lower_time1.textContent = "10:35–11:20";
    lower_time1.className = "colored left_column";
    row4.appendChild(lower_time1);
    let lower_label1 = document.createElement("td");
    lower_label1.textContent = "Lunch";
    lower_label1.className = "colored left_midcolumn";
    row4.appendChild(lower_label1);
    let upper_time1 = document.createElement("td");
    upper_time1.textContent = "10:45–11:50";
    upper_time1.className = "right_midcolumn";
    row4.appendChild(upper_time1);
    let upper_label1 = document.createElement("td");
    upper_label1.textContent = "Block " + blocks[1 + has_preblock];
    upper_label1.className = "right_column";
    row4.appendChild(upper_label1);
    schedule_table.appendChild(row4);

    let row5 = document.createElement("tr");
    let lower_time2 = document.createElement("td");
    lower_time2.textContent = "11:30–12:35";
    lower_time2.className = "left_column";
    row5.appendChild(lower_time2);
    let lower_label2 = document.createElement("td");
    lower_label2.textContent = "Block " + blocks[1 + has_preblock];
    lower_label2.className = "left_midcolumn";
    row5.appendChild(lower_label2);
    let upper_time2 = document.createElement("td");
    upper_time2.textContent = "11:50–12:35";
    upper_time2.className = "colored right_midcolumn";
    row5.appendChild(upper_time2);
    let upper_label2 = document.createElement("td");
    upper_label2.textContent = "Lunch";
    upper_label2.className = "colored right_column";
    row5.appendChild(upper_label2);
    schedule_table.appendChild(row5);

    let spacer_row2 = document.createElement("tr");
    spacer_row2.className = "spacer";
    schedule_table.appendChild(spacer_row2);
    
    let row6 = document.createElement("tr");
    let time3 = document.createElement("td");
    time3.textContent = "12:45–1:50";
    time3.className = "left_column";
    time3.colSpan = 2;
    row6.appendChild(time3);
    let label3 = document.createElement("td");
    label3.textContent = "Block " + blocks[2 + has_preblock];
    label3.className = "right_column";
    label3.colSpan = 2;
    row6.appendChild(label3);
    schedule_table.appendChild(row6);
    
    let row7 = document.createElement("tr");
    let time4 = document.createElement("td");
    time4.textContent = "2:00–3:00";
    time4.className = "left_column";
    time4.colSpan = 2;
    row7.appendChild(time4);
    let label4 = document.createElement("td");
    label4.textContent = "Founders Period (F60)";
    label4.className = "right_column";
    label4.colSpan = 2;
    row7.appendChild(label4);
    schedule_table.appendChild(row7);
}

function makeMassScheduleTable(blocks_input) {
    let blocks = blocks_input.split(" ")[0].split(",");

    let warning_row = document.createElement("tr");
    let warning = document.createElement("td");
    warning.textContent = "Please note the early 9 am start.";
    warning.className = "warning mass_warning";
    warning.colSpan = 2;
    warning_row.appendChild(warning);
    schedule_table.appendChild(warning_row);
    
    let row1 = document.createElement("tr");
    let time1 = document.createElement("td");
    time1.textContent = "9:00–9:55";
    time1.className = "left_column";
    time1.setAttribute("style", "font-weight: bold;");
    row1.appendChild(time1);
    let label1 = document.createElement("td");
    label1.textContent = "Block " + blocks[0];
    label1.className = "right_column";
    label1.setAttribute("style", "font-weight: bold;");
    row1.appendChild(label1);
    schedule_table.appendChild(row1);
    
    let row2 = document.createElement("tr");
    let time2 = document.createElement("td");
    time2.textContent = "10:05–11:35";
    time2.className = "left_column";
    row2.appendChild(time2);    
    let label2 = document.createElement("td");
    label2.textContent = "Mass";
    label2.className = "right_column";
    row2.appendChild(label2);
    schedule_table.appendChild(row2);
    
    let row3 = document.createElement("tr");
    let time3 = document.createElement("td");
    time3.textContent = "11:35–12:20";
    time3.className = "colored left_column";
    row3.appendChild(time3);
    let label3 = document.createElement("td");
    label3.textContent = "All-School Lunch";
    label3.className = "colored right_column";
    row3.appendChild(label3);
    schedule_table.appendChild(row3);
    
    let row4 = document.createElement("tr");
    let time4 = document.createElement("td");
    time4.textContent = "12:30–1:25";
    time4.className = "left_column";
    row4.appendChild(time4);
    let label4 = document.createElement("td");
    label4.textContent = "Block " + blocks[2];
    label4.className = "right_column";
    row4.appendChild(label4);
    schedule_table.appendChild(row4);
    
    let row5 = document.createElement("tr");
    let time5 = document.createElement("td");
    time5.textContent = "1:35–2:30";
    time5.className = "left_column";
    row5.appendChild(time5);
    let label5 = document.createElement("td");
    label5.textContent = "Block " + blocks[3];
    label5.className = "right_column";
    row5.appendChild(label5);
    schedule_table.appendChild(row5);
}

function makeFullScheduleTable(blocks_input) {
    schedule_table.className = "full";

    let blocks = blocks_input.split(" ")[0].split(",");
    let pe_health = blocks_input.includes("(") && blocks_input.split(" (")[1].split(")")[0] == "PE/Health";
    has_preblock = blocks.includes("7") || blocks.includes("8");

    if (has_preblock) {
        let row = document.createElement("tr");
        let time = document.createElement("td");
        time.textContent = "8:00–9:15";
        time.className = "left_column";
        time.colSpan = 2;
        row.appendChild(time);
        let label = document.createElement("td");
        label.textContent = "Block " + blocks[0];
        label.className = "right_column";
        label.colSpan = 2;
        if (pe_health) {
            label.textContent += " ";
            let span = document.createElement("span");
            span.textContent = "(PE/Health)";
            label.appendChild(span);
        }
        row.appendChild(label);
        schedule_table.appendChild(row);
    }
    
    let row1 = document.createElement("tr");
    let time1 = document.createElement("td");
    time1.textContent = "9:30–10:10";
    time1.className = "left_column";
    time1.colSpan = 2;
    row1.appendChild(time1);
    let label1 = document.createElement("td");
    label1.textContent = "Block " + blocks[0 + has_preblock];
    label1.className = "right_column";
    label1.colSpan = 2;
    row1.appendChild(label1);
    schedule_table.appendChild(row1);
    
    let row2 = document.createElement("tr");
    let time2 = document.createElement("td");
    time2.textContent = "10:20–11:00";
    time2.className = "left_column";
    time2.colSpan = 2;
    row2.appendChild(time2);
    let label2 = document.createElement("td");
    label2.textContent = "Block " + blocks[1 + has_preblock];
    label2.className = "right_column";
    label2.colSpan = 2;
    row2.appendChild(label2);
    schedule_table.appendChild(row2);
    
    let row3 = document.createElement("tr");
    let time3 = document.createElement("td");
    time3.textContent = "11:10–11:50";
    time3.className = "left_column";
    time3.colSpan = 2;
    row3.appendChild(time3);
    let label3 = document.createElement("td");
    label3.textContent = "Block " + blocks[2 + has_preblock];
    label3.className = "right_column";
    label3.colSpan = 2;
    row3.appendChild(label3);
    schedule_table.appendChild(row3);

    let spacer_row1 = document.createElement("tr");
    spacer_row1.className = "spacer";
    schedule_table.appendChild(spacer_row1);
    
    let row4 = document.createElement("tr");
    let lower_header = document.createElement("td");
    lower_header.textContent = "Frosh/Soph";
    lower_header.className = "lunch_header left_column";
    lower_header.colSpan = 2;
    row4.appendChild(lower_header);
    let upper_header = document.createElement("td");
    upper_header.textContent = "Juniors/Seniors";
    upper_header.className = "lunch_header right_column";
    upper_header.colSpan = 2;
    row4.appendChild(upper_header);
    schedule_table.appendChild(row4);

    let row5 = document.createElement("tr");
    let lower_time1 = document.createElement("td");
    lower_time1.textContent = "12:00–12:30";
    lower_time1.className = "left_column";
    row5.appendChild(lower_time1);
    let lower_label1 = document.createElement("td");
    lower_label1.textContent = "Lunch";
    lower_label1.className = "left_midcolumn";
    row5.appendChild(lower_label1);
    let upper_time1 = document.createElement("td");
    upper_time1.textContent = "12:00–12:40";
    upper_time1.className = "right_midcolumn";
    row5.appendChild(upper_time1);
    let upper_label1 = document.createElement("td");
    upper_label1.textContent = "Block " + blocks[3 + has_preblock];
    upper_label1.className = "right_column";
    row5.appendChild(upper_label1);
    schedule_table.appendChild(row5);

    let row6 = document.createElement("tr");
    let lower_time2 = document.createElement("td");
    lower_time2.textContent = "12:40–1:20";
    lower_time2.className = "left_column";
    row6.appendChild(lower_time2);
    let lower_label2 = document.createElement("td");
    lower_label2.textContent = "Block " + blocks[3 + has_preblock];
    lower_label2.className = "left_midcolumn";
    row6.appendChild(lower_label2);
    let upper_time2 = document.createElement("td");
    upper_time2.textContent = "12:50–1:20";
    upper_time2.className = "right_midcolumn";
    row6.appendChild(upper_time2);
    let upper_label2 = document.createElement("td");
    upper_label2.textContent = "Lunch";
    upper_label2.className = "right_column";
    row6.appendChild(upper_label2);
    schedule_table.appendChild(row6);

    let spacer_row2 = document.createElement("tr");
    spacer_row2.className = "spacer";
    schedule_table.appendChild(spacer_row2);
    
    let row7 = document.createElement("tr");
    let time4 = document.createElement("td");
    time4.textContent = "1:30–2:10";
    time4.className = "left_column";
    time4.colSpan = 2;
    row7.appendChild(time4);
    let label4 = document.createElement("td");
    label4.textContent = "Block " + blocks[4 + has_preblock];
    label4.className = "right_column";
    label4.colSpan = 2;
    row7.appendChild(label4);
    schedule_table.appendChild(row7);
    
    let row8 = document.createElement("tr");
    let time5 = document.createElement("td");
    time5.textContent = "2:20–3:00";
    time5.className = "left_column";
    time5.colSpan = 2;
    row8.appendChild(time5);
    let label5 = document.createElement("td");
    label5.textContent = "Block " + blocks[5 + has_preblock];
    label5.className = "right_column";
    label5.colSpan = 2;
    row8.appendChild(label5);
    schedule_table.appendChild(row8);
}

function updateBlueGreenSchedule(blocks_input) {
    // If there is no previously recorded period or the period has since changed, determine the new period
    let period_unchanged = timeIsBeforePresent(schedule_times[current_periods + "_end"]);
    if (current_periods === undefined || current_periods.length == 0 || period_unchanged) {
        current_periods = [];
        let keys = Object.keys(schedule_times);
        for (let i = 0; i < keys.length; i += 2) {
            // If we are not after the start time of the iterated period, go the next period
            if (timeIsAfterPresent(schedule_times[keys[i]])) continue;
            // If we are not before the end time of the iterated period, go the next period
            if (timeIsBeforePresent(schedule_times[keys[i + 1]])) continue;
            // If we have passed the above two conditions, we are within period that has bounds specified by keys[i] and keys[i + 1]
            current_periods.push(keys[i].substring(0, keys[i].lastIndexOf("_")));
        }

        // Reset table coloring
        schedule_table.querySelectorAll("td.active").forEach((cell) => {
            cell.classList.remove("active");
            // cell.classList.remove("progess-bar-section1");
            // cell.classList.remove("progess-bar-section2");
            // cell.classList.remove("progess-bar-section3");
            // cell.classList.remove("progess-bar-section4");
        });
        // document.body.style.setProperty("section1-bar-width", "0px");
        // document.body.style.setProperty("section2-bar-width", "0px");
        // document.body.style.setProperty("section3-bar-width", "0px");
        // document.body.style.setProperty("section4-bar-width", "0px");

        // If we are only in a passing period (no upper or lower period), extend the delay on the interval and terminate execution early (TODO - consider adding visual for passing periods)
        if (current_periods.length == 0) {
            let keys = Object.keys(schedule_times);
            // If we are after the school day, clear the interval and terminate execution early
            if (timeIsBeforePresent(schedule_times[keys[keys.length - 1]])) {
                clearInterval(update_interval);
                return;
            }
            console.log("Checking if we are near the end of the passing period");
            // If we are near the end of the passing period, update more frequently (every 30 seconds)
            if (keys.reduce((minimum, current) => {
                let diff = Math.abs(getTimeDiff(schedule_times[current]));
                return (diff < minimum ? diff : minimum);
            }, getTimeDiff(Object.values(schedule_times)[0])) < 60 * 1000) {
                // If we are already on a 10-second update interval, keep it. Otherwise, make one
                if (update_frequency == 10) return;
                clearInterval(update_interval);
                update_frequency = 10;
                update_interval = setInterval(updateBlueGreenSchedule, 10 * 1000);
            } else {
                // If we are already on a 60-second update interval, keep it. Otherwise, make one
                if (update_frequency == 60) return;
                clearInterval(update_interval);
                update_frequency = 60;
                update_interval = setInterval(updateBlueGreenSchedule, 60 * 1000);
            }
            return;
        }
        // Set cells as active
        current_periods.forEach((period) => {
            document.getElementById(period + "_time").classList.add("active");
            document.getElementById(period + "_label").classList.add("active");
        });
    }

    // Once cells have the active tag, update the width of the progress bar
    /*for (let i = 0; i < current_periods.length; i++) {
        let period = current_periods[i];
        let time_cell = document.getElementById(period + "_time");
        let label_cell = document.getElementById(period + "_label");
        console.log(time_cell);
        console.log(label_cell);
        // TODO - offsetWidth not matching (is greater than) width listed in browser; causing issues in inadvertently not shiting to second section
        let total_width = time_cell.offsetWidth + label_cell.offsetWidth;
        console.log("Time from " + new Date(random_time) + " to " + schedule_times[period + "_start"] + ": " + getTimeDiff(schedule_times[period + "_start"]) / 1000 / 60);
        console.log("Length of " + period + " from " + schedule_times[period + "_start"] + " to " + schedule_times[period + "_end"] + ": " + getTimeDiff(schedule_times[period + "_start"], schedule_times[period + "_end"]) / 1000 / 60);
        let target_width = getTimeDiff(schedule_times[period + "_start"]) / getTimeDiff(schedule_times[period + "_start"], schedule_times[period + "_end"]) * total_width;
        console.log("target_width = " + target_width + "px\ntime_cell.offsetWidth = " + time_cell.offsetWidth + "px\nlabel_cell.offsetWidth = " + label_cell.offsetWidth + "px")

        // TODO - some progress bars rendering backwards: short half on left element
        time_cell.classList.add("progress-bar-section" + (i * 2 + 1));
        if (target_width > time_cell.offsetWidth) {
            document.body.style.setProperty("--section" + (i * 2 + 1) + "-bar-width", "100%");
            label_cell.classList.add("progress-bar-section" + (i * 2 + 2));
            document.body.style.setProperty("--section" + (i * 2 + 2) + "-bar-width", (target_width - time_cell.offsetWidth) + "px");
            console.log("Expanded to second section with excess width of " + (target_width - time_cell.offsetWidth) + "px");
        } else {
            document.body.style.setProperty("--section" + (i * 2 + 1) + "-bar-width", target_width + "px");
            console.log("Kept to one section with width of " + target_width + "px");
        }
    }*/

   // If we are in a passing period or we are near the beginning of a block, update more frequently (every 10 seconds)
   if (current_periods.reduce((minimum, period) => {
       let diff = Math.abs(getTimeDiff(schedule_times[period + "_end"]));
       return (diff < minimum ? diff : minimum);
    }, getTimeDiff(Object.values(schedule_times)[0])) < 30 * 1000) {
        // If we are already on a 10 second interval, don't bother setting a new one
        if (update_frequency == 10) return;
        clearInterval(update_interval); // Will not error if update_frequency is undefined (ie. setting updateInterval for first time)
        update_frequency = 10;
        update_interval = setInterval(updateBlueGreenSchedule, 10 * 1000);
    }
    // If we are near the end of a period, update less frequently (every 30 seconds)
    else {
        // If we are already on a 10 second interval, don't bother setting a new one
        if (update_frequency == 30) return;
        clearInterval(update_interval);
        update_frequency = 30;
        update_interval = setInterval(updateBlueGreenSchedule, 30 * 1000);
    }
}

function updateGoldSchedule(blocks_input) {
    // If there is no previously recorded period or the period has since changed, determine the new period
    let period_unchanged = timeIsBeforePresent(schedule_times[current_periods + "_end"]);
    if (!current_periods || period_unchanged) {
        current_periods = [];
        let keys = Object.keys(schedule_times);
        for (let i = 0; i < keys.length; i += 2) {
            // If we are not after the start time of the iterated period, go the next period
            if (timeIsAfterPresent(schedule_times[keys[i]])) continue;
            // If we are not before the end time of the iterated period, go the next period
            if (timeIsBeforePresent(schedule_times[keys[i + 1]])) continue;
            // If we have passed the above two conditions, we are within period that has bounds specified by keys[i] and keys[i + 1]
            current_periods.push(keys[i].substring(0, keys[i].lastIndexOf("_")));
        }

        // Reset table coloring
        schedule_table.querySelectorAll("td.active").forEach((cell) => cell.classList.remove("active"));

        // If we are only in a passing period (no upper or lower period), extend the delay on the interval and terminate execution early (TODO - consider adding visual for passing periods)
        // If we are after the school day, clear the interval and terminate execution early
        if (current_periods.length == 0) {
            clearInterval(update_interval);
            let keys = Object.keys(schedule_times);
            if (timeIsAfterPresent(schedule_times[keys[keys.length - 1]])) update_interval = setInterval(updateBlueGreenSchedule, (10 * 60 * 1000 + 10 * 1000));
            return;
        }
        // Set cells as active
        current_periods.forEach((period) => {
            document.getElementById(period + "_time").classList.add("active");
            document.getElementById(period + "_label").classList.add("active");
        });
    }

    update_interval = setInterval(updateBlueGreenSchedule, 30 * 1000);
}

/**
 * Compares the provided time to the present
 * 
 * @param {string} time The time to compare to, given as HH:MM with or without leading zeros
 * @returns {boolean} `true` if the provided time is before the current time, `false` otherwise
 */
function timeIsBeforePresent(time) {
    if (override_time) return new Date(new Intl.DateTimeFormat("en-US").format(new Date()) + " " + time).getTime() < (new Date(new Intl.DateTimeFormat("en-US").format(new Date()) + " " + override_time).getTime() + Date.now() - initialization_time);
    else return new Date(new Intl.DateTimeFormat("en-US").format(new Date()) + " " + time).getTime() < Date.now();
}


/**
 * Compares the provided time to the present
 * (inverse of `timeIsBeforePresent`)
 * 
 * @param {string} time The time to compare to, given as HH:MM with or without leading zeros
 * @returns {boolean} `true` if the provided time is after the current time, `false` otherwise
 */
function timeIsAfterPresent(time) {
    return !(timeIsBeforePresent(time));
}

/**
 * Determines the difference between two times in milliseconds  
 * Assumes `time2` is after `time1`.
 * If `time2` is not provided, `time1` is subtracted from the present, assuming `time1` is before the present.
 * 
 * @param {string} time1 The first time, given as HH:MM with or without leading zeros
 * @param {string} time2 (Optional) The second time, given as HH:MM with or without leading zeros
 * @returns {number} The number of milliseconds `time2` is after `time1`
 */
function getTimeDiff(time1, time2) {
    let format = new Intl.DateTimeFormat("en-US");
    if (typeof time2 !== "undefined") return new Date(format.format(new Date()) + " " + time2).getTime() - new Date(format.format(new Date()) + " " + time1).getTime();
    else if (override_time) return (new Date(format.format(new Date()) + " " + override_time).getTime() + Date.now() - initialization_time) - new Date(format.format(new Date()) + " " + time1).getTime();
    else return Date.now() - new Date(format.format(new Date()) + " " + time1).getTime();
}

window.onload = () => {
    initialization_time = Date.now();

    // Overriden date and schedule formats must match as specified below
    let date_regex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    let schedule_regexes = [
        /^Blue: (?:7,)?[1-3],[1-3],[1-3](?: \(PE\/Health\))?$/,
        /^Green: (?:8,)?[4-6],[4-6],[4-6](?: \(PE\/Health\))?$/,
        /^Gold: (?:[78],)?[1-6],F30,[1-6],[1-6](?: \(PE\/Health\))?$/,
        /^F-AM: (?:[78],)?[1-6],F70,[1-6],[1-6](?: \(PE\/Health\))?$/,
        /^F-PM: (?:[78],)?[1-6],[1-6],[1-6],F60(?: \(PE\/Health\))?$/,
        /^Mass: [1-6],Mass,[1-6],[1-6]$/,
        /^Full: (?:[78],)?[1-6],[1-6],[1-6],[1-6],[1-6],[1-6](?: \(PE\/Health\))?$/
    ];
    let time_regex = /^[0-2]?\d:[0-5]\d/;
    const url_parameters = new URLSearchParams(window.location.search);
    if (url_parameters.has("date")) {
        let date_input = url_parameters.get("date");
        if (date_regex.test(date_input) && new Date(date_input).toString() != "Invalid Date") override_date = date_input;
    }
    if (url_parameters.has("schedule")) {
        let schedule_input = url_parameters.get("schedule").toString();
        if (schedule_regexes.some(regexr => regexr.test(schedule_input))) override_schedule = schedule_input;
    }
    if (url_parameters.has("time")) {
        let time_input = url_parameters.get("time");
        if (time_regex.test(time_input) && new Date("1 January 1970 " + time_input).toString() != "Invalid Date") override_time = time_input;
    }
    
    SCHEDULE_TYPES = JSON.parse(SCHEDULE_TYPES_JSON);
    Object.keys(SCHEDULE_TYPES).forEach((date) => {
        if (!(schedule_regexes.some((regexr) => regexr.test(SCHEDULE_TYPES[date])))) console.warn(date + " schedule not recognized: " + SCHEDULE_TYPES[date]);
    });
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) document.querySelector("head link:last-of-type").href = "images/SHC_Shamrock_white.png";
    onNewDay();
}

// Update tab icon based on preferred color scheme
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    const newColorScheme = event.matches ? "dark" : "light";
    if (newColorScheme == "dark") document.querySelector("head link:last-of-type").href = "images/SHC_Shamrock_white.png";
    else document.querySelector("head link:last-of-type").href = "images/SHC_Shamrock_green.gif";
});