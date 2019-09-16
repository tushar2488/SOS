// Copyright (c) 2019, Youtility Technologies Pvt. Ltd and contributors
// For license information, please see license.txt

frappe.ui.form.on('Salary Payout', {
	refresh: function(doc, dt, dn) {
		var me = this;
		if(cur_frm.doc.docstatus==1) {
			doc.add_custom_button(__('Make Bank Entry'),function() { me.make_bank_payment(doc, dt, dn) });
		}
	},
	start_date: function(frm) {
		frm.set_value("bank_name",'');
	},
	end_date: function(frm) {
		frm.set_value("bank_name",'');
	},
	bank_name: function(frm) {
		//frappe.msgprint("Selected Bank is : "+frm.doc.bank_name);
		frm.set_value("payment_account",'');
		frm.events.get_salary_slip_data(frm);
	},

	get_salary_slip_data: function(frm) {
		//frm.events.check_mandatory_to_fetch(frm);
		if(frm.doc.start_date != null && frm.doc.start_date != null && frm.doc.start_date < frm.doc.end_date){
			frappe.call({
				method: "sos.sos.doctype.salary_payout.salary_payout.salary_slip_data",
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
	}	
});
make_bank_payment = function(doc, cdt, cdn) {
	console.log("@@@@@ make_bank_payment:::::")

	if (cur_frm.doc.company && cur_frm.doc.start_date && cur_frm.doc.end_date) {
		return cur_frm.call({
			//doc: doc,
			method: "make_bank_payment_entry",
			doc: cur_frm.doc,
			callback: function (r) {
				if (r.message)
					var doc = frappe.model.sync(r.message)[0];
					frappe.set_route("Form", doc.doctype, doc.name);
				}
			});
			console.log("@@@@@ Empdata:::::",doc.empdata.length)

		} else {
				frappe.msgprint(__("Company, From Date and To Date is mandatory"));
	}
}
