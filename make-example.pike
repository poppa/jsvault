/*
  Author: Pontus Östlund <https://profiles.google.com/poppanator>

  Permission to copy, modify, and distribute this source for any legal
  purpose granted as long as my name is still attached to it. More
  specifically, the GPL, LGPL and MPL licenses apply to this software.
*/

int main(int argc, array(string) argv)
{
  if (argc < 2) {
    werror("Missing input file\n");
    return 1;
  }

  string file = argv[1];

  if (!Stdio.exist(file)) {
    werror("\"%s\" doesn't exist!\n", file);
    return 1;
  }

  string t = Stdio.read_file(file);

  Regexp.PCRE.Widestring re;
  re = Regexp.PCRE.Widestring("^(\\s*)");

  function unpad = lambda (string s) {
    s = String.trim_all_whites(s);
    array(string) lines = s/"\n";

    if (sizeof(lines) > 1) {
      string ind;

      foreach (lines, string line) {
        re->matchall(line, lambda (mixed a) {
          if (!ind && a[0] != "") {
            ind = a[0];
          }
        });

        if (ind) break;
      }

      lines = map(lines, lambda (string ss) {
        if (has_prefix(ss, ind)) {
          ss = ss[sizeof(ind)..];
        }

        return ss;
      });

      s = lines * "\n";
    }

    return s;
  };

  MyParser p = MyParser();
  object stx = Syntaxer.get_parser("js");
  stx->line_wrap = ({ "<div>", "</div>" });

  function script = lambda (Parser.HTML pp, mapping attr, string content) {
    string x = stx->parse(unpad(content));
    string y = "<div class='code'><div class='src'>" + x + "</div></div>\n";
    string z = "<div class='result'><script>" +  content + "</script></div>";
    return ({ y + z });
  };

  p->add_containers(([
    "body" : lambda (Parser.HTML pp, mapping attr, string content) {
      Parser.HTML xp = pp->clone();
      xp->add_container("script", script);
      return ({ "<body>" + xp->feed(content)->read() + "</body>" });
    }
  ]));

  t = p->feed(t)->read();

  string name = basename(file);
  array(string) nparts = name/".";
  name = (nparts[..<1]*".") + ".html";

  Stdio.write_file(combine_path(dirname(file), name), t);

	return 0;
}

class MyParser {
  inherit Parser.HTML;
  public bool is_body = false;
}