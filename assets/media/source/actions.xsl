<?xml version="1.0"?> 
<!--
    actions.xsl
    This code is licensed under a Creative Commons License: http://creativecommons.org/licenses/by-sa/1.0/

    In conjunction with a build step that applies this XSL sheet to the struts-config.xml file,
    this generates a collection of Action java classes as part of the automatic build.
    
    This is useful if you have a tool automatically building the struts-config file from a source like a spreadsheet.
    Automatic generation saves a little coding time up front, but its real benefit is when the design goes through
    the inevitable refactoring: the classes are automatically updated and strong typing catches any places where
    business logic classes have not been updated. Thus, the combination of code generation and type checking
    helps make refactoring easier.
    
    One architectural assumption is that each action class forwards to a Delegate class that actually contains
    the business logic. The idea is that a number of different actions might be handled by the same logic class. A
    special attribute added to each element in the structs-config file identifies the appropriate Delegate.
    
    The Action classes are thus responsible for forwarding action requests. A nice side effect for strong, declarative
    typing enthusiasts is that the forwarding call is strongly typed, documenting the proper form bean's type in Java.
    
-->
<xsl:stylesheet
        xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
        version="1.0"
        xmlns:redirect="org.apache.xalan.xslt.extensions.Redirect"
        extension-element-prefixes="redirect">
    <xsl:output method="text"/>

    <!-- VARIABLES -->
           
    <xsl:variable
            name = "java-source-path"
            select = "'..\source\'"/>
    <xsl:variable
            name = "qualified-action-superclass"
            select = "'com.braithwaite-lee.struts.action.AbstAction'"/>
    <xsl:variable
            name = "action-superclass-name">
        <xsl:call-template name="class-name">
            <xsl:with-param name="name"><xsl:value-of select="$qualified-action-superclass"/></xsl:with-param>
        </xsl:call-template>
    </xsl:variable>
    <xsl:variable
            name = "action-superclass-package">
        <xsl:call-template name="class-package">
            <xsl:with-param name="name"><xsl:value-of select="$qualified-action-superclass"/></xsl:with-param>
        </xsl:call-template>
    </xsl:variable>
    <xsl:variable
            name = "qualified-default-delegate"
            select = "'com.braithwaite-lee.struts.delegate.DefaultDelegate'"/>
    <xsl:variable
            name = "qualified-global-forward"
            select = "'com.braithwaite-lee.struts.action.GlobalForward'"/>
    <xsl:variable
            name = "global-forward-name">
        <xsl:call-template name="class-name">
            <xsl:with-param name="name"><xsl:value-of select="$qualified-global-forward"/></xsl:with-param>
        </xsl:call-template>
    </xsl:variable>
    <xsl:variable
            name = "global-forward-package">
        <xsl:call-template name="class-package">
            <xsl:with-param name="name"><xsl:value-of select="$qualified-global-forward"/></xsl:with-param>
        </xsl:call-template>
    </xsl:variable>
    <xsl:variable
            name = "default-action-form"
            select = "'org.apache.struts.action.ActionForm'"/>
    <xsl:variable
            name = "default-form-package"
            select="'com.braithwaite-lee.struts.formbean'"/>
    <xsl:variable
            name = "qualified-navigation-view-name"
            select = "'com.braithwaite-lee.struts.form.NavigationViewBean'"/> 
    <xsl:variable
            name = "navigation-view-name">
        <xsl:call-template name="class-name">
            <xsl:with-param name="name"><xsl:value-of select="$qualified-navigation-view-name"/></xsl:with-param>
        </xsl:call-template>
    </xsl:variable>

    <!-- TEMPLATES -->

    <xsl:template match="/">
        <xsl:apply-templates select="/struts-config/action-mappings"/>
        <xsl:apply-templates select="/struts-config/global-forwards"/>
    </xsl:template>

    <xsl:template match="/struts-config/global-forwards">
        <redirect:write select="concat(
                $java-source-path,
                translate($qualified-global-forward, '.', '\'),
                '.java')">/**
 *
 * This class was written by the build process.
 * DO NOT MODIFY.
 *
 * <xsl:value-of select="'$'"/>Header:<xsl:value-of select="'$'"/>
 *
 * <xsl:value-of select="'$'"/>Log:<xsl:value-of select="'$'"/>
 *
 */
package <xsl:value-of select="$global-forward-package"/>;

import com.braithwaite-lee.util.AbstractTypeSafeEnumeration;

public class <xsl:value-of select="$global-forward-name"/>
extends AbstractTypeSafeEnumeration
{

protected <xsl:value-of select="$global-forward-name"/> (final String pString)
{
    super(pString);
}
<xsl:for-each select="forward">
    public static final  <xsl:value-of select="$global-forward-name"/><xsl:text> </xsl:text><xsl:value-of select="attribute::name"/> = new <xsl:value-of select="$global-forward-name"/>(&quot;<xsl:value-of select="attribute::name"/>&quot;);</xsl:for-each>


}
        </redirect:write>
    </xsl:template>

    <xsl:template match="/struts-config/action-mappings">

        <xsl:for-each select="action">
        
<!-- ERROR MESSAGES
-->
            <xsl:if test="not(boolean(string(attribute::type)))">
                <xsl:message>Action <xsl:value-of select="attribute::path"/> is missing a type. Skipping.</xsl:message>
            </xsl:if>
            <xsl:if test="contains(attribute::type,'/')">
                <xsl:message>Action <xsl:value-of select="attribute::path"/> has a malformed type: <xsl:value-of select="attribute::type"/>. Skipping.</xsl:message>
            </xsl:if>

<xsl:if test = "starts-with(attribute::type,'com.braithwaite-lee.struts.action')">
            
    <xsl:variable name = "delegate" select = "set-property[string(@property) = 'delegate']/@value"/>
    <xsl:variable name = "form" select = "@name"/>
    <xsl:variable name = "delegate" select = "set-property[string(@property) = 'delegate']/@value"/>
    <xsl:variable name = "type" select = "@type"/>
    
    <xsl:choose>
        <xsl:when test = "boolean(
                preceding-sibling::action
                        [$type = @type]
                        [boolean(string(@name))])
                and not(boolean(string($form)))">
            <xsl:message>Multiple references to <xsl:value-of select = "$type"/>, first has a form, second doesn't.
            </xsl:message>
        </xsl:when>
        <xsl:when test = "boolean(
                preceding-sibling::action
                        [$type = @type]
                        [not(boolean(string(@name)))])
                and boolean(string($form))">
            <xsl:message>Multiple references to <xsl:value-of select = "$type"/>, first doesn't have a form, second does.
            </xsl:message>
        </xsl:when>
        <xsl:when test = "boolean(preceding-sibling::action
                [$type = @type]
                [$form != @name])">
            <xsl:message>Multiple references to <xsl:value-of select = "$type"/> with different forms.
            </xsl:message>
        </xsl:when>
    </xsl:choose>
    
    <xsl:choose>
        <xsl:when test = "boolean(preceding-sibling::action
                [$type = @type]
                [$delegate != set-property[string(@property) = 'delegate']/@value])">
            <xsl:message>Multiple references to <xsl:value-of select = "$type"/> with different delegates.
            </xsl:message>
        </xsl:when>
        <xsl:when test = "boolean(
                preceding-sibling::action
                        [$type = @type]
                        [boolean(string(set-property[string(@property) = 'delegate']/@value))])
                and not(boolean(string($delegate)))">
            <xsl:message>Multiple references to <xsl:value-of select = "$type"/>, first has a delegate, second doesn't.
            </xsl:message>
        </xsl:when>
        <xsl:when test = "boolean(
                preceding-sibling::action
                        [$type = @type]
                        [not(boolean(string(set-property[string(@property) = 'delegate']/@value)))])
                and boolean(string($delegate))">
            <xsl:message>Multiple references to <xsl:value-of select = "$type"/>, first doesn't have a delegate, second does.
            </xsl:message>
        </xsl:when>
    </xsl:choose>
    
</xsl:if>
    
<!-- ACTION LOGIC
-->
            <xsl:if test="boolean(string(attribute::type)) and not(contains(attribute::type,'/'))">

                <!-- 'LOCAL' VARIABLES -->
                
                <xsl:variable name="num-forwards"
                        select="count(forward)"/>

                <xsl:variable name="java-class-name">
                    <xsl:call-template name="name-filter">
                        <xsl:with-param name="name">
                            <xsl:call-template name="class-name">
                                <xsl:with-param name="name"><xsl:value-of select="attribute::type"/></xsl:with-param>
                            </xsl:call-template>
                        </xsl:with-param>
                    </xsl:call-template>
                </xsl:variable>
                <xsl:variable name="java-package">
                    <xsl:call-template name="package-filter">
                        <xsl:with-param name="package">
                            <xsl:call-template name="class-package">
                                <xsl:with-param name="name">
                                    <xsl:value-of select="attribute::type"/>
                                </xsl:with-param>
                            </xsl:call-template>
                        </xsl:with-param>
                    </xsl:call-template>
                </xsl:variable>
                <xsl:variable
                        name="qualified-delegate">
                    <xsl:variable name="raw-delegate">
                        <xsl:value-of select="child::set-property[string(attribute::property) = 'delegate']/attribute::value"/>
                    </xsl:variable>
                    <xsl:choose>
                        <xsl:when test="boolean(string($raw-delegate))">
                            <xsl:value-of select="$raw-delegate"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="$qualified-default-delegate"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <xsl:variable
                        name = "delegate-name">
                    <xsl:call-template name="class-name">
                        <xsl:with-param name="name"><xsl:value-of select="$qualified-delegate"/></xsl:with-param>
                    </xsl:call-template>
                </xsl:variable>
                <xsl:variable
                        name = "delegate-package">
                    <xsl:call-template name="class-package">
                        <xsl:with-param name="name"><xsl:value-of select="$qualified-delegate"/></xsl:with-param>
                    </xsl:call-template>
                </xsl:variable>
                <xsl:variable
                        name = "action-verb">
                    <xsl:choose>
                        <xsl:when test="string($java-class-name) = concat(substring-before($java-class-name,'Action'),'Action')">
                            <xsl:value-of select="substring-before($java-class-name,'Action')"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="$java-class-name"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <xsl:variable
                       name="form-reference"
                       select = "attribute::name"/>
                <xsl:variable
                       name="qualified-reference">
                    <xsl:if test="boolean(attribute::name)">
                        <xsl:value-of select="/struts-config/form-beans/form-bean[attribute::name = $form-reference]/attribute::type"/>
                    </xsl:if>
                </xsl:variable>
                <xsl:variable
                        name="qualified-form">
                    <xsl:choose>
                        <xsl:when test="boolean(string($qualified-reference))">
                            <xsl:value-of select="$qualified-reference"/>
                        </xsl:when>
                        <xsl:when test="boolean(attribute::name)">
                            <xsl:value-of select="$default-action-form"/>
                        </xsl:when>
                    </xsl:choose>
                </xsl:variable>
                <xsl:variable
                        name = "form-name">
                    <xsl:if test="boolean(string($qualified-form))">
                        <xsl:call-template name="class-name">
                            <xsl:with-param name="name"><xsl:value-of select="$qualified-form"/></xsl:with-param>
                        </xsl:call-template>
                    </xsl:if>
                </xsl:variable>
                <xsl:variable
                        name = "form-package">
                    <xsl:if test="boolean(string($qualified-form))">
                        <xsl:call-template name="class-package">
                            <xsl:with-param name="name"><xsl:value-of select="$qualified-form"/></xsl:with-param>
                        </xsl:call-template>
                    </xsl:if>
                </xsl:variable>
                <xsl:variable
                        name = "java-path"
                        select="concat(
                            $java-source-path,
                            translate(attribute::type, '.', '\'),
                            '.java')"/>
                    
                <xsl:variable name = "num-raw-forms"
                        select = "count(forward[boolean(child::set-property[string(attribute::property) = 'form'])])"/>
                        
                <xsl:variable name = "first-form"
                        select = "forward/set-property[string(attribute::property) = 'form' and string(attribute::value) != '']/attribute::value"/>
                        
                <xsl:variable name = "num-forms">
                    <xsl:choose>
                        <xsl:when test="$num-raw-forms = 0">0</xsl:when>
                        <xsl:when test="$num-raw-forms = 1">1</xsl:when>
                        <xsl:when test="$num-raw-forms > count(
                                forward[
                                    boolean(
                                        child::set-property[string(attribute::property) = 'form' and string($first-form) = string(attribute::value)]
                                    )
                                ]
                            )">2</xsl:when>
                        <xsl:otherwise>1</xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                       
                <xsl:variable name = "qualified-result-form-type">
                    <xsl:choose>
                        <xsl:when test="$num-forms != 1">
                            <xsl:value-of select="$default-action-form"/>
                        </xsl:when>
                        <xsl:when test="contains($first-form,'.')">
                            <xsl:value-of select="$first-form"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="concat($default-form-package,'.',$first-form)"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                
                <xsl:if test="$qualified-result-form-type = '' and $num-forms > 0">
                    <xsl:message>qualified-result-form-type is empty in action <xsl:value-of select="attribute::path"/>: missing &lt;form-bean&gt; element?</xsl:message>
                </xsl:if>
                
                <xsl:variable
                        name = "result-form-name">
                    <xsl:if test="boolean(string($qualified-result-form-type))">
                        <xsl:call-template name="class-name">
                            <xsl:with-param name="name"><xsl:value-of select="$qualified-result-form-type"/></xsl:with-param>
                        </xsl:call-template>
                    </xsl:if>
                </xsl:variable>
                <xsl:variable
                        name = "result-form-package">
                    <xsl:if test="boolean(string($qualified-result-form-type))">
                        <xsl:call-template name="class-package">
                            <xsl:with-param name="name"><xsl:value-of select="$qualified-result-form-type"/></xsl:with-param>
                        </xsl:call-template>
                    </xsl:if>
                </xsl:variable>

                <xsl:if test="boolean(string($java-package)) and boolean(string($java-class-name))">
                    <redirect:open file="$java-path"/><redirect:write select="$java-path">
/**
 * <xsl:value-of select="$java-class-name"/>.java
 *
 * Generated by actions.xsl and xalan
 *
 * DO NOT MODIFY BY HAND!!!
 *
 * <xsl:value-of select="'$'"/>Header:<xsl:value-of select="'$'"/>
 *
 * <xsl:value-of select="'$'"/>Log:<xsl:value-of select="'$'"/>
 *
 */
package <xsl:value-of select="$java-package"/>;

<xsl:if test="string($java-package) != string($action-superclass-package)">import <xsl:value-of select="$qualified-action-superclass"/>;
</xsl:if><xsl:if test="string($java-package) != string($action-superclass-package)">import <xsl:value-of select="$qualified-action-superclass"/>;
</xsl:if><xsl:if test="boolean(string($qualified-form)) and string($java-package) != string($form-package)">import <xsl:value-of select="$qualified-form"/>;
</xsl:if><xsl:if test="boolean(string($qualified-result-form-type)) and string($java-package) != string($result-form-package)">import <xsl:value-of select="$qualified-result-form-type"/>;
</xsl:if>import <xsl:value-of select="$qualified-delegate"/>;
import org.apache.struts.action.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import junit.framework.Assert;

public final class <xsl:value-of select="$java-class-name"/>
extends <xsl:value-of select="$action-superclass-name"/>
{
                  <!-- ERROR STRINGS SHOULD BE GENERATED HERE -->
<xsl:if test="$num-forwards > 1">
public static class Forward
extends <xsl:value-of select="$global-forward-name"/>
{
<xsl:for-each select="forward">
    <xsl:choose>
        <xsl:when test="boolean(string(attribute::name)) and boolean(string(attribute::path))">
    public static final Forward <xsl:call-template name="symbolic-string">
                        <xsl:with-param name="str"><xsl:value-of select="attribute::name"/></xsl:with-param>
                    </xsl:call-template> = new Forward(&quot;<xsl:value-of select="attribute::name"/>&quot;);
        </xsl:when>
        <xsl:otherwise>
            <xsl:message>// Forward in <xsl:value-of select="$java-class-name"/> lacks name or path. Skipping.</xsl:message>
        </xsl:otherwise>
</xsl:choose></xsl:for-each>

    private Forward (final String pString)
    {
        super(pString);
    }
}

</xsl:if>public ActionForward execute (
        final ActionMapping mapping,
        final ActionForm requestForm,
        final HttpServletRequest request,
        final HttpServletResponse response
        )
throws Exception
{
    ActionErrors errors = new ActionErrors();
    ActionForward actionForward<xsl:choose>
        <xsl:when test="$num-forwards = 0"> = mapping.getInputForward();
    Assert.assertNotNull(&quot;<xsl:value-of select="$java-class-name"/> had a bad actionForward: &quot;
            + &quot;There was no forward configured, but we couldn't find the a default mapping. &quot;
            + &quot;Check the input attribute of the action mapping.&quot;,
            actionForward);
</xsl:when>
        <xsl:when test="$num-forwards = 1"> = mapping.findForward(&quot;<xsl:value-of select="child::forward/attribute::name"/>&quot;);
    Assert.assertNotNull(&quot;<xsl:value-of select="$java-class-name"/> had a bad actionForward, &quot;
            + &quot;The configuration specified one forward, <xsl:value-of select="child::forward/attribute::name"/>, but &quot;
            + &quot;we couldn't find a mapping for it. &quot;
            + &quot;There may be a problem with the action configurations, possibly multiple &quot;
            + &quot;mappings with disparate sets of forwards.&quot;,
            actionForward);
</xsl:when>
<xsl:otherwise>;</xsl:otherwise></xsl:choose>
    try
    {
<xsl:if test="$num-forwards > 1">
        Forward[] vForwards = new Forward[1];</xsl:if><xsl:text>
        </xsl:text>
<xsl:if test="$num-forms > 0">
    <xsl:value-of select="$result-form-name"/> resultsForm = </xsl:if>
    <xsl:value-of select="$delegate-name"/>.Instance().handle<xsl:value-of select="$action-verb"/> (<xsl:if test="boolean(string($qualified-form))">
                        (<xsl:value-of select="$form-name"/>) requestForm,</xsl:if>
                        request<xsl:if test="$num-forwards > 1">,
                        vForwards</xsl:if>
                );
<xsl:if test="$num-forms > 0">
        Assert.assertNotNull(&quot;<xsl:value-of select="$delegate-name"/> failed to return a &quot;
                + &quot;<xsl:value-of select="$form-name"/> &quot;
                + &quot;from the method handle<xsl:value-of select="$action-verb"/>&quot;,
                resultsForm);
        setResultsForm(mapping, request, &quot;<xsl:value-of select="$result-form-name"/>&quot;, resultsForm);</xsl:if>
<xsl:if test="$num-forwards > 1">
        Assert.assertNotNull(&quot;<xsl:value-of select="$delegate-name"/> &quot;
                + &quot;failed to set a <xsl:value-of select="$java-class-name"/>.Forward &quot;
                + &quot;in the method handle<xsl:value-of select="$action-verb"/>&quot;,
                vForwards[0]);
        actionForward = mapping.findForward( vForwards[0].toString() );
        Assert.assertNotNull(&quot;<xsl:value-of select="$java-class-name"/> had a bad &quot; + vForwards[0].toString() + &quot; actionForward, &quot;
                + &quot;<xsl:value-of select="$delegate-name"/>.handle<xsl:value-of select="$action-verb"/> &quot;
                + &quot;returned &quot; + vForwards[0].toString() + " but we couldn't find a mapping for it. &quot;
                + &quot;There may be a problem with the action configurations, possibly multiple &quot;
                + &quot;mappings with disparate sets of forwards.&quot;,
                actionForward);
</xsl:if>
    }
    catch (BaseApplicationException bae)
    {
        logException(bae);
        errors.add(ERRORAPPLICATIONKEYWORD, new ActionError(ERRORAPPLICATION));
        actionForward = mapping.getInputForward();
        Assert.assertNotNull(&quot;<xsl:value-of select="$java-class-name"/> had a bad getInputForward(), &quot;
                + &quot;<xsl:value-of select="$delegate-name"/>.handle<xsl:value-of select="$action-verb"/> &quot;
                + &quot;seems to have thrown an Application Error, and we couldn't find an input mapping. &quot;
                + &quot;Check the input attribute of the action mapping.&quot;,
                actionForward);
    }
    catch (Throwable t)  // System Error :-(
    {
        logException(t);
        errors.add(ActionErrors.GLOBAL_ERROR, new ActionError(ERRORSYSTEM));
        actionForward = mapping.findForward(FORWARDSYSTEMERROR);
        Assert.assertNotNull(&quot;<xsl:value-of select="$java-class-name"/> had a bad &quot; + FORWARDSYSTEMERROR + &quot; actionForward, &quot;
                + &quot;<xsl:value-of select="$delegate-name"/>.handle<xsl:value-of select="$action-verb"/> &quot;
                + &quot;seems to have thrown a System Error, and we couldn't find a mapping for &quot; + FORWARDSYSTEMERROR,
                actionForward);
    }
    if ( !errors.empty() )
        saveErrors(request,errors);

    Assert.assertNotNull(&quot;<xsl:value-of select="$java-class-name"/> had a bad actionForward, and I don't know why.&quot;
            + &quot;It probably wasn't <xsl:value-of select="$delegate-name"/>'s fault: &quot;
            + &quot;perhaps there's a configuration error?&quot;,
            actionForward);
    return actionForward;

}

}</redirect:write><redirect:close file="$java-path"/>
                </xsl:if>                
            </xsl:if>
        </xsl:for-each>
    </xsl:template>

    <!-- HELPER TEMPLATES -->
    
    <xsl:template name="symbolic-string">
            <xsl:param name="str"/>
        <xsl:value-of select="translate(
                $str,
                'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM',
                'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM')"/>
    </xsl:template>

    <xsl:template name="class-name">
            <xsl:param name="name"/>
        <xsl:choose>
            <xsl:when test="contains($name,'.')">
                <xsl:call-template name="class-name">
                    <xsl:with-param name="name"><xsl:value-of select="substring-after($name,'.')"/></xsl:with-param>
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise><xsl:value-of select="$name"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="class-package">
            <xsl:param name="name"/>
        <xsl:variable
                name = "class-name">
            <xsl:call-template name="class-name">
                <xsl:with-param name="name">
                    <xsl:value-of select="$name"/>
                </xsl:with-param>
            </xsl:call-template>
        </xsl:variable>
        <xsl:value-of
                select="substring-before($name,concat('.',$class-name))"/>
    </xsl:template>

    <xsl:template name="name-filter">
            <xsl:param name="name"/>
        <xsl:choose>
            <xsl:when test="starts-with($name,'Abst')">
                <xsl:value-of select="''"/>
            </xsl:when>
            <xsl:when test="$name = 'DispatchForward'">
                <xsl:value-of select="''"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$name"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template name="package-filter">
            <xsl:param name="package"/>
        <xsl:choose>
            <xsl:when test="starts-with($package,'com.braithwaite-lee.struts.action')"><xsl:value-of select="$package"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="''"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

</xsl:stylesheet>