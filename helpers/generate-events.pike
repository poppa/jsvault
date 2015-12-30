int main(int argc, array(string) argv)
{
  array(mapping) events = ({});

  Calendar.Second cur = Calendar.parse("%Y-%M-%D", "2016-01-01");
  Calendar.Second to  = Calendar.parse("%Y-%M-%D", "2016-03-31");

  while (cur < to) {
    cur = cur + (cur->day() * 1);
    int rnd = random(5);

    if (rnd < 2) {
      continue;
    }

    events += get_event(cur, random(3) + 1);
  }

  Stdio.write_file("generated-events.json", Standards.JSON.encode(events));

  return 0;
}

string lipsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. "
"Donec elit ex, sodales id molestie non, egestas vulputate lectus. "
"Pellentesque a nibh vitae ex venenatis maximus. Proin a porta diam. Mauris "
"nec ante suscipit, dictum tellus ut, auctor urna. Donec eu rhoncus sem, "
"eleifend rutrum lectus. Fusce vel urna pellentesque leo accumsan blandit sit "
"amet sodales orci. Integer eu vehicula turpis. Morbi eget nisi id metus "
"vehicula aliquet. Proin non tempus risus, vel lacinia risus. Fusce blandit "
"blandit quam, vitae varius nunc pellentesque a. Proin ut ante vitae augue "
"tempor laoreet eu at lectus. Mauris vulputate vel lectus a auctor. Vivamus "
"tempor orci sed lacus dignissim ultrices.";

array(string) nlipsum;

string get_title()
{
  if (!nlipsum) {
    string t = lower_case(lipsum) - "." - ",";
    nlipsum = t / " ";
  }

  array(string) out = ({});
  int len = random(6);
  if (len < 3) len = 3;

  while (sizeof(out) < len) {
    out += ({ random(nlipsum) });
  }

  string ret = out * " ";
  return upper_case(ret[0..0]) + ret[1..];
}

array(mapping) get_event(Calendar.Second d, int n)
{
  array a = ({});
  array times = ({ "08:00", "10:00", "12:00", "14:00", "16:00", "18:00" });

  for (int i; i < n; i++) {
    string tm = random(times);
    string title = get_title();

    Calendar.Second newtime = Calendar.parse("%Y-%M-%D %h:%m:%s",
                                             d->format_ymd() + " " +
                                             tm + ":00");

    a += ({
      ([ "isotime"   : newtime->format_mtime(),
         "isodate"   : newtime->format_ymd(),
         "timestamp" : newtime->unix_time(),
         "title"     : title ])
    });
  }

  return Array.sort_array(a, lambda (mapping x, mapping y) {
    return x->timestamp > y->timestamp;
  });
}
