# -*- coding: utf-8 -*-
# Copyright (c) 2019, Youtility Technologies Pvt. Ltd and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, erpnext
from frappe import _
from frappe.model.document import Document
from frappe.utils import add_days, cint, cstr, flt, getdate, rounded, date_diff, money_in_words

class SalaryPayout(Document):
	def validate(self):
		company_currency = erpnext.get_company_currency(self.company)
		self.total_in_words = money_in_words(self.total, company_currency)

	def get_employees_salary_details(self):
		self.set('empdata', [])
		ss_list = self.get_ss_list()
		print("::::::::::::: Salary Slip List::::::::::::: %s" % ss_list)
		if not ss_list:
			frappe.throw(_("No salary slips created for the mentioned criteria"))
		self.total=0
		for d in ss_list:
			self.total += d.net_pay
			self.append('empdata', {'employee':d.employee,
				'employee_name': d.employee_name,
				'bank_name': d.bank_name,
				'bank_ac_no': d.bank_account_no,
				'net_pay': d.net_pay,
				'rounded_total': d.rounded_total})

	def get_ss_list(self):
		""" Returns list of salary slips based on selected criteria """
		ss_list = frappe.db.sql("""
			SELECT * FROM `tabSalary Slip` t1
			WHERE t1.docstatus = 1
			and t1.start_date >= '%s'
			and t1.end_date <= '%s'
			and t1.bank_name = '%s'
			ORDER BY t1.bank_name DESC """% (self.start_date, self.end_date, self.bank_name), as_dict=True)
		return ss_list