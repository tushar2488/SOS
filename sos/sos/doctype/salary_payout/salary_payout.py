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

	def before_submit(self):
		#self.get_employees_salary_details()
		pass

	def get_employees_salary_details(self):
		self.set('empdata', [])
		ss_list = self.get_ss_list()
		#print("::::::::::::: Salary Slip List::::::::::::: %s" % ss_list)
		if not ss_list:
			frappe.throw(_("No salary slips created for the mentioned criteria"))
		self.total=0
		sp_list= self.validate_payout_already_done()
		print("########### sp_list ####### %s ###" % sp_list)
		for d in ss_list:
			if d.employee not in sp_list:
				self.total += d.net_pay
				self.append('empdata', {'employee':d.employee,
					'salary_slip_name': d.name,
					'payroll_entry': d.payroll_entry,
					'net_pay': d.net_pay,
					'rounded_total': d.rounded_total
				})

	def get_ss_list(self):
		""" Returns list of salary slips based on selected criteria """
		ss_list = frappe.db.sql("""
			SELECT * FROM `tabSalary Slip` t1
			WHERE t1.docstatus = 1
			and t1.start_date >= '%s'
			and t1.end_date <= '%s'
			and t1.bank_name = '%s'
			ORDER BY t1.bank_account_no DESC """% (self.start_date, self.end_date, self.bank_name), as_dict=True)
		return ss_list

	def validate_payout_already_done(self):
		""" Returns list of salary slips based on selected criteria """
		sp=[]
		sp_list = frappe.db.sql("""
			SELECT employee FROM `tabSalary Payout Detail` s1
			WHERE s1.docstatus = 1
			and s1.start_date >= '%s'
			and s1.end_date <= '%s'
			and s1.bank_name = '%s' """% (self.start_date, self.end_date, self.bank_name), as_dict=True)
		if sp_list:
			sp= [x.employee for x in sp_list]
		return sp