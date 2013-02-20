(let* (
	(funds
		(file->entity "NAVajo/funds.tbn"))
	(first-funds
		(first funds))
	(nav-date
		(dictionary-ref first-funds "navpsdate"))
	(compound-date
		(dictionary-ref first-funds "returndate"))
	(moneymarket
		(first (file->entity "NAVajo/mm.tbn")))
	(fund-index
		(matrix->index (file->entity "NAVajo/NAVajoLookup.tbn") "FUNDNUMBER"))
	(all-funds
		(let* (
			(funds-by-category (dictionary)) ; dictionary of dictionaries of vectors
			(add-a-fund
				(lambda (fund)
					(let* (
						(raw-fund-number (dictionary-ref fund "fundnumber"))
						(clean-fund-number
							(if (null? raw-fund-number)
								""
								raw-fund-number))
						(lookup (dictionary-ref fund-index clean-fund-number)))
						(if (false? (null? lookup))
							(let* (
								(category (dictionary-ref lookup "CATEGORY"))
								(type (dictionary-ref lookup "TYPE"))
								(funds-by-type
									(let (
										(potential-dictionary
											(dictionary-ref funds-by-category category)))
										(if (null? potential-dictionary)
											(begin
												(set! potential-dictionary (dictionary))
												(dictionary-set! funds-by-category category potential-dictionary)
												potential-dictionary)
											potential-dictionary)))
								(funds-collection
									(let (
										(potential-collection
											(dictionary-ref funds-by-type type)))
										(begin
											(if (null? potential-collection)
												(set! potential-collection (list)))
											potential-collection))))
								(dictionary-set! funds-by-type type (add-first funds-collection fund)))
							'()))))
			(add-a-collection
				(lambda (fund-collection)
					(inject-into
						fund-collection
						'()
						(lambda (ignore a-fund)
							(begin
								(add-a-fund a-fund)
								funds-by-category))))))
			(add-a-collection funds)))
	(make-rows
		(lambda (fundType fundCategory)
			(let (
				(clean	(lambda (value) (if (== value "n/a") "--" value))))
				(inject-into
					(dictionary-ref
						(dictionary-ref all-funds fundCategory)
						fundType)
					"" ; seed
					(lambda	(seed fund) ; write function
							(let* (
								(raw-fund-number (dictionary-ref fund "fundnumber"))
								(clean-fund-number
									(if (null? raw-fund-number)
										""
										raw-fund-number))
								(lookup (dictionary-ref fund-index clean-fund-number)))
								(+
									seed
									(if (null? lookup)
										""
										<HTML>
											<TR>
												<TD WIDTH=100 ALIGN=LEFT><SERVER>(dictionary-ref lookup "ENGLISH")</SERVER></TD>
												<TD ALIGN=RIGHT><SERVER>(clean (dictionary-ref fund "oneyearreturn"))</SERVER></TD>
												<TD ALIGN=RIGHT><SERVER>(clean (dictionary-ref fund "twoyearreturn"))</SERVER></TD>
												<TD ALIGN=RIGHT><SERVER>(clean (dictionary-ref fund "threeyearreturn"))</SERVER></TD>
												<TD ALIGN=RIGHT><SERVER>(clean (dictionary-ref fund "fiveyearreturn"))</SERVER></TD>
												<TD ALIGN=RIGHT><SERVER>(dictionary-ref fund "navps")</SERVER></TD>
												<TD ALIGN=RIGHT><SERVER>(clean (dictionary-ref fund "change"))</SERVER></TD>
											</TR>
										</HTML>))))))))
		(canadian
				<HTML>
					<FONT SIZE=4><B>Canadian Equity &amp; Balanced Funds<BR>100% RRSP-Eligible</B></FONT>
				</HTML>)
		(bond100
				<HTML>
					<FONT SIZE=4><B>Bond Funds<BR>100% RRSP-Eligible</B></FONT>
				</HTML>)
		(bond20
				<HTML>
					<FONT SIZE=4><B>Bond Funds<BR>20% RRSP-Eligible</B></FONT>
				</HTML>)
		(mm <HTML><FONT FACE=HELVETICA SIZE=2><B>Money Market 100% RRSP-Eligible</B></FONT></HTML>)
		(multiadviser
				<HTML>
					<FONT SIZE=4><B>Multi-Adviser International Equity Funds<BR>20% RRSP-Eligible</B></FONT>
				</HTML>)
		(diversified
				<HTML>
					<FONT SIZE=4><B>Diversified International Funds<BR>100% RRSP-Eligible</B></FONT>
				</HTML>)
		(nrow	(lambda	(text colour colspan)
						<HTML><TR><TD COLSPAN=<SERVER>colspan</SERVER> ALIGN=LEFT BGCOLOR=#<SERVER>colour</SERVER>><SERVER>text</SERVER></TD></TR></HTML>))
		(fullrow (lambda	(text colour)
							(nrow text colour "7")))
		(fundheader
				<HTML>
					<TR> 
						<TD WIDTH=100>&nbsp;</TD>
						<TD COLSPAN=4 ALIGN=CENTER>
							<FONT SIZE=2>Compound Total Returns % to <SERVER>compound-date</SERVER></FONT>
						</TD>
						<TD COLSPAN=2 ALIGN=CENTER><FONT SIZE=2>CDN$ as at <SERVER>nav-date</SERVER></FONT></TD>
					</TR>
					<TH WIDTH=100>&nbsp;</TH><TH>1 yr</TH><TH>2 yr</TH><TH>3 yr</TH><TH>5 yr</TH>
					<TH NOWRAP>Net Asset<BR>Value</TH><TH>Daily<BR>Change</TH>
				</HTML>))
		<HTML>
			<HEAD>
			  <META NAME="GENERATOR" CONTENT="MendelScheme">
			  <TITLE>Global Strategy Daily Fund Prices (Demo)</TITLE>
			</HEAD>
	
			<BODY BGCOLOR="#ffffff">
						
				<BLOCKQUOTE><FONT FACE="helvetica" FONT SIZE="2" ALIGN="CENTER">
					<A HREF="homepage.html"><FONT COLOR=#001769>HOME</FONT></A><FONT COLOR=#FF0000> )&#009;</FONT><FONT COLOR=#001769><A HREF="Welcome.html">WELCOME</A>  </FONT><FONT COLOR=#FF0000>|</FONT><FONT COLOR=#001769>&#009;<A HREF="http://www.Globalstrategyfunds.com/INCommuni-k.html">COMMUNIQUE </A> </FONT><FONT COLOR=#FF0000>|</FONT><FONT COLOR=#001769>&#009;<A HREF="fund.news.html">NEWS AND INSIGHTS  </A></FONT><FONT COLOR=#FF0000>|</FONT><FONT COLOR=#001769>&#009;<A HREF="views.html">PUBLICATIONS </A> </FONT><FONT COLOR=#FF0000>|</FONT><FONT COLOR=#001769>&#009;<A HREF="distributors.html">ADVISERS</A></FONT>
				</FONT></BLOCKQUOTE>
				
				<TABLE>
					<TR>
						<TD VALIGN=TOP>
							<IMG SRC="/NAVajo/SideBar.GIF" BORDER=0>
						</TD>
						<TD VALIGN=TOP>
							<IMG SRC="/NAVajo/TopBar.GIF" BORDER=0>
							<TABLE WIDTH=420 CELLSPACING=5 CELLPADDING=5 BORDER=1>
								<SERVER>
									(+
										(fullrow canadian "E1BFBF")
										fundheader
										(make-rows "EquityBalanced" "Canadian")
										
										(fullrow bond100 "BFC5DA")
										fundheader
										(make-rows "Fixed" "Canadian")
										(make-rows "Fixed" "Diversified")
										
										(fullrow bond20 "BFC5DA")
										fundheader
										(make-rows "Fixed" "International")
									)
								</SERVER>
							</TABLE>
							<TABLE WIDTH=420 CELLSPACING=5 CELLPADDING=5 BORDER=1>
								<TR> 
									<SERVER>
										(nrow
											<HTML><FONT SIZE=4><B>Money Market Fund<BR>100% RRSP-Eligible</B></FONT></HTML>
											"BFC5DA"
											"4")
									</SERVER>
									<TD WIDTH=100>&nbsp;</TD>
									<TD COLSPAN=2 ALIGN=CENTER>
										<FONT SIZE=2>Money Market yields % to <SERVER>(dictionary-ref moneymarket "yielddate")</SERVER></FONT>
									</TD>
									<TD>&nbsp;</TD>
								</TR>
								<TH WIDTH=100>&nbsp;</TH>
								<TH>Current<BR>Yield (%)</TH>
								<TH>Effective<BR>Yield (%)</TH>
								<TH NOWRAP>Net Asset<BR>Value</TH>
								<TR>
									<TD WIDTH=100 ALIGN=LEFT>Money Market</TD>
									<TD ALIGN=RIGHT><SERVER>(dictionary-ref moneymarket "currentyield")</SERVER></TD>
									<TD ALIGN=RIGHT><SERVER>(dictionary-ref moneymarket "effectiveyield")</SERVER></TD>
									<TD ALIGN=RIGHT><SERVER>(dictionary-ref moneymarket "navps")</SERVER></TD>
								</TR>
							</TABLE>
							<TABLE WIDTH=420 CELLSPACING=5 CELLPADDING=5 BORDER=1>
								<SERVER>
									(+
										(fullrow multiadviser "CADBCD")
										fundheader
										(make-rows "EquityBalanced" "International")
										
										(fullrow diversified "CAC1DD")
										fundheader
										(make-rows "EquityBalanced" "Diversified")
									)
								</SERVER>
							</TABLE>
						</TD>
					</TR>
				</TABLE>
				
				<HR>
				
				<P><FONT SIZE=2>All the returns and net asset values reported here are
				for Class A units where more than one class of any given Global Strategy
				mutual fund exists.</P>
				
				<P>The indicated rates of return are the historical compounded annual 
				total returns (except for 1-month, 3-month, 6-month and 1-year figures, 
				which are simple total returns) including changes in unit value and 
				reinvestment of all distributions, and do not take into account sales, 
				redemption, distribution or optional charges payable by any unitholder, 
				which would have reduced returns. Annualized historical yield is for 
				the seven-day period ended on month's end, annualized in the case of 
				effective yield by compounding the seven-day return.</P>
				
				<P>Past returns are not necessarily indicative of future returns.
				Investment return, yield and unit value will fluctuate. Mutual funds are
				not CDIC-insured. This information is not, and should not be construed as,
				investment advice to any party. Investment advice should be obtained from
				a broker or dealer.</FONT></P>
				
				<!-- This document was created by Reginald Braithwaite-Lee on
				December 12, 1997 using MendelScheme-->
				
			</BODY>
			
		</HTML>)