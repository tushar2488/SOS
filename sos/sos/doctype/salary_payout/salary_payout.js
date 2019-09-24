// Copyright (c) 2019, Youtility Technologies Pvt. Ltd and contributors
// For license information, please see license.txt

frappe.ui.form.on('Salary Payout', {
	onload: function(frm) {
        if(frm.doc.bank_name && frm.doc.start_date && frm.doc.end_date){
            frm.set_value("bank_name",'');
            frm.refresh_field("bank_name");
        }
	},
	refresh: function(frm) {
		if(frm.doc.docstatus==0) {
            //frm.page.clear_primary_action();
            frm.add_custom_button(__("Get Salary Details"),
                function() {
                    frm.events.get_salary_slip_data(frm);
                }
            ).toggleClass('btn-primary', !(frm.doc.empdata || []).length);
		}
	},
	clear_employee_payout_table: function (frm) {
		frm.clear_table('empdata');
		frm.refresh();
	},
	start_date: function(frm) {
		frm.events.clear_employee_payout_table(frm);
	},
	end_date: function(frm) {
		frm.events.clear_employee_payout_table(frm);
	},
	bank_name: function(frm) {
		frm.events.clear_employee_payout_table(frm);
	},
	get_salary_slip_data: function(frm) {
	    return frappe.call({
			doc: frm.doc,
			method: 'get_employees_salary_details',
			callback: function(r) {
				if (r.docs[0].empdata){
					frm.save();
					frm.refresh();
                }
            }
        });
    }
		//frm.events.check_mandatory_to_fetch(frm);
		/*if(frm.doc.start_date != null && frm.doc.start_date != null && frm.doc.start_date < frm.doc.end_date){
			frappe.call({
				method: "salary_slip_data",
				args: {
					"bank_name": frm.doc.bank_name,
					"start_date": frm.doc.start_date,
					"end_date": frm.doc.end_date
				},
				callback: function(r,rt)
				{
					frappe.model.clear_table(frm.doc, "empdata");
					if(r.message) {
						var total_val=0;
							$.each(r.message, function(i, d) {
							var row = frappe.model.add_child(frm.doc, "Salary Payout Detail", "empdata");
		            			row.employee = d.employee;
								row.employee_name = d.employee_name;
								row.ifsc_code = d.ifsc_code;
								row.bank_ac_no = d.bank_ac_no;
								row.bank_name = d.bank_name;
								row.net_pay = d.net_pay;
								row.rounded_total = d.rounded_total;
								row.bank_entry_status = d.bank_entry_status;
								row.salary_slip_name = d.salary_slip_name;
								total_val=total_val+d.rounded_total;
								//set value for single field;
								//frappe.model.set_value(row.doctype, row.name,"bank_name",d);
						});
						frm.set_value("total",total_val);
						frm.refresh_field("empdata");
					}else {
						empdata_flag = false
						frappe.msgprint("No data found");
					}
					frm.refresh_field("empdata");
				}
			});
		}else{
			frappe.msgprint("Select valid Start date and End date");
		}
	}	*/
});
